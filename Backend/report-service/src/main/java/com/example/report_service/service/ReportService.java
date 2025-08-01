package com.example.report_service.service;

import com.example.project_service.gRPC.AllProjectResponses;
import com.example.project_service.gRPC.ProjectResponse;
import com.example.report_service.client.InternManagerGrpcClient;
import com.example.report_service.client.ProjectManagerGrpcClient;
import com.example.report_service.dto.*;
import com.example.report_service.model.Project;
import com.example.report_service.model.Report;
import com.example.report_service.model.Review;
import com.example.report_service.model.User;
import com.example.report_service.repository.ReportReposInterface;
import com.example.report_service.repository.ReviewReposInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final ReportReposInterface reportRepos;
    private final ReviewReposInterface reviewRepos;
    private final InternManagerGrpcClient grpcClient;
    private final ProjectManagerGrpcClient projectManagerGrpcClient;
    private final MapperService mapper;

    @Autowired
    public ReportService(ReportReposInterface reportRepos,
                         ReviewReposInterface reviewRepos,
                         InternManagerGrpcClient grpcClient,
                         ProjectManagerGrpcClient projectManagerGrpcClient,
                         MapperService mapper) {
        this.reportRepos = reportRepos;
        this.reviewRepos = reviewRepos;
        this.grpcClient = grpcClient;
        this.projectManagerGrpcClient = projectManagerGrpcClient;
        this.mapper = mapper;
    }

    @Transactional
    public ReportResponseDTO createReport(String jwtToken, Long userId, ReportRequestDTO dto) {
        System.out.println("Creating report for userId: " + userId);
        var grpcResponse = grpcClient.getInternManagerByUserId(jwtToken, userId);  // pass raw token
        //map with responseDTO
        if (grpcResponse == null) {
            throw new RuntimeException("User not found for userId: " + userId);
        }



        
        Report report = new Report();
        report.setIntern(new User(grpcResponse.getUserId()));
        report.setManager(new User(grpcResponse.getManagerId()));
        report.setProject(new Project(grpcResponse.getProjectId()));
        report.setTitle(dto.getTitle());
        report.setPeriodTo(dto.getPeriodTo());
        report.setTaskCompleted(dto.getTaskCompleted());
        report.setChallenges(dto.getChallenges());
        report.setNextWeekGoals(dto.getNextWeekGoals());
        report.setCreatedAt(LocalDateTime.now());

        var projectResponse = projectManagerGrpcClient.getProjectInfo(jwtToken, grpcResponse.getProjectId());
        if (projectResponse == null) {
            throw new RuntimeException("Project not found for userId: " + userId);
        }

        ProjectResponseDTO projectResponseDTO = new ProjectResponseDTO(
                projectResponse.getProjectId(),
                projectResponse.getProjectName(),
                projectResponse.getProjectDescription()
        );

        
        Report saved = reportRepos.saveReport(report);
        return mapper.toReportResponseDTO(saved, null, projectResponseDTO);
    }


    @Transactional
    public Page<ReportResponseDTO> getReportsWithReviews(Long userId, Pageable pageable) {
        Page<Report> reports = reportRepos.findByUserId(userId, pageable);
        List<Long> reportIds = reports.stream().map(Report::getId).collect(Collectors.toList());

        Map<Long, ReviewResponseDTO> reviewMap = reviewRepos.findByReportIds(reportIds)
                .stream().collect(Collectors.toMap(
                        Review::getReportId,
                        review -> mapper.toReviewResponseDTO(review)
                ));


        return reports.map(report -> {
            ReviewResponseDTO reviewDto = reviewMap.get(report.getId());
            return mapper.toReportResponseDTO(report, reviewDto, null);
        });
    }

    public Page<ReportResponseDTO> searchReports(Long userId, String keyword, Pageable pageable) {
        Page<Report> reports = reportRepos.searchByTitleAndFeedback(userId, keyword, pageable);
        return mapReportsWithReviews(reports);
    }

    public Page<ReportResponseDTO> filterReports(Long userId, String status, String period, Pageable pageable) {
        Page<Report> reports = reportRepos.filterByStatusAndDate(userId, status, period, pageable);
        return mapReportsWithReviews(reports);
    }

    public ReportStatsDTO getUserReportStats(Long userId) {
        Long total = reportRepos.countByUserId(userId);
        Double avg = reviewRepos.calculateAverageRatingByUserId(userId);
        return new ReportStatsDTO(total, avg != null ? avg : 0.0);
    }

    @Transactional
    public ManagerReportStatsDTO getManagerReportStats(Long managerId) {
        Long total = reportRepos.findByManagerId(managerId, Pageable.unpaged()).getTotalElements();
        Long pending = reportRepos.countPendingByManagerId(managerId);
        Long reviewed = reportRepos.countReviewedByManagerId(managerId);
        Double avg = reviewRepos.calculateAverageRatingByManagerId(managerId);
        return new ManagerReportStatsDTO(total, pending, reviewed, avg != null ? avg : 0.0);
    }

    public Page<ReportResponseDTO> searchManagerReports(String jwtToken,Long managerId, String title, Pageable pageable) {
        Page<Report> reports = reportRepos.searchByManagerAndTitle(managerId, title, pageable);
        List<Long> reportIds = reports.stream().map(Report::getId).collect(Collectors.toList());
        Map<Long, ReviewResponseDTO> reviewMap = reviewRepos.findByReportIds(reportIds)
                .stream().collect(Collectors.toMap(
                        Review::getReportId,
                        review -> mapper.toReviewResponseDTO(review)
                ));
        // get all the project response from gRPC
        AllProjectResponses allProjectResponses = projectManagerGrpcClient.getProjects(jwtToken, reportIds);
        // map reports to ReportResponseDTO and map projects to ProjectResponseDTO
        return reports.map(report -> {
            ReviewResponseDTO reviewDto = reviewMap.get(report.getId());
            ProjectResponse projectResponse = allProjectResponses.getProjectsList().stream()
                    .filter(project -> project.getProjectId() == report.getProject().getId())
                    .findFirst()
                    .orElse(null);
            ProjectResponseDTO projectResponseDTO = new ProjectResponseDTO(
                    projectResponse.getProjectId(),
                    projectResponse.getProjectName(),
                    projectResponse.getProjectDescription()
            );
            return mapper.toReportResponseDTO(report, reviewDto, projectResponseDTO);
        });
    }

    public Page<ReportResponseDTO> filterManagerReports(String jwtToken,Long managerId, String status, String period, Pageable pageable) {
        Page<Report> reports = reportRepos.filterByManagerAndStatusAndDate(managerId, status, period, pageable);
        List<Long> reportIds = reports.stream().map(Report::getId).collect(Collectors.toList());
        Map<Long, ReviewResponseDTO> reviewMap = reviewRepos.findByReportIds(reportIds)
                .stream().collect(Collectors.toMap(
                        Review::getReportId,
                        review -> mapper.toReviewResponseDTO(review)
                ));
        
        // get all the project response from gRPC
        AllProjectResponses allProjectResponses = projectManagerGrpcClient.getProjects(jwtToken, reportIds);
        return reports.map(report -> {
            ReviewResponseDTO reviewDto = reviewMap.get(report.getId());
            ProjectResponse projectResponse = allProjectResponses.getProjectsList().stream()
                    .filter(project -> project.getProjectId() == report.getProject().getId())
                    .findFirst()
                    .orElse(null);
            ProjectResponseDTO projectResponseDTO = new ProjectResponseDTO(
                    projectResponse.getProjectId(),
                    projectResponse.getProjectName(),
                    projectResponse.getProjectDescription()
            );
            return mapper.toReportResponseDTO(report, reviewDto, projectResponseDTO);
        });
    }

    @Transactional
    public ReportResponseDTO createReview(String authHeader,Long managerId, ReviewRequestDTO dto) {

        Review review = new Review();
        review.setReport(new Report(dto.getReportId()));
        review.setFeedback(dto.getFeedback());
        review.setRating(dto.getRating());
        review.setCreatedAt(LocalDateTime.now());

        Review saved = reviewRepos.saveReview(review);

        // get the report to return together
        Report report = reportRepos.getReportById(dto.getReportId()).orElseThrow();
        // get the project response from gRPC
        ProjectResponse projectResponse = projectManagerGrpcClient.getProjectInfo(authHeader, report
                .getManager().getId());

        ProjectResponseDTO projectResponseDTO = new ProjectResponseDTO(
                projectResponse.getProjectId(),
                projectResponse.getProjectName(),
                projectResponse.getProjectDescription()
        );
        // map the report to ReportResponseDTO
        return mapper.toReportResponseDTO(report, mapper.toReviewResponseDTO(saved), projectResponseDTO);

    }

    @Transactional
    public Page<ReportResponseDTO> getReportsByManagerId(String authHeader,Long managerId, Pageable pageable) {
        Page<Report> reports = reportRepos.findByManagerId(managerId, pageable);

        List<Long> reportIds = reports.stream()
                .map(Report::getId)
                .collect(Collectors.toList());

        Map<Long, ReviewResponseDTO> reviewMap = reviewRepos.findByReportIds(reportIds)
                .stream()
                .collect(Collectors.toMap(
                        review -> review.getReport().getId(),
                        mapper::toReviewResponseDTO
                ));

        // get all the project response from gRPC
        AllProjectResponses allProjectResponses = projectManagerGrpcClient.getProjects(authHeader, reportIds);
        return reports.map(report -> {
            ReviewResponseDTO reviewDto = reviewMap.get(report.getId());
            ProjectResponse projectResponse = allProjectResponses.getProjectsList().stream()
                    .filter(project -> project.getProjectId() == report.getProject().getId())
                    .findFirst()
                    .orElse(null);
            ProjectResponseDTO projectResponseDTO = new ProjectResponseDTO(
                    projectResponse.getProjectId(),
                    projectResponse.getProjectName(),
                    projectResponse.getProjectDescription()
            );
            return mapper.toReportResponseDTO(report, reviewDto, projectResponseDTO);
        });
    }

    @Transactional
    public Page<ReportResponseDTO> getAllReportsWithReviews(String jwtToken,Pageable pageable) {
        Page<Report> reports = reportRepos.findAllReports(pageable);
        List<Long> reportIds = reports.stream().map(Report::getId).collect(Collectors.toList());
        Map<Long, ReviewResponseDTO> reviewMap = reviewRepos.findByReportIds(reportIds)
                .stream().collect(Collectors.toMap(
                        Review::getReportId,
                        review -> mapper.toReviewResponseDTO(review)
                ));
        

        // get all the project response from gRPC
        AllProjectResponses allProjectResponses = projectManagerGrpcClient.getProjects(jwtToken, reportIds);
        return reports.map(report -> {
            ReviewResponseDTO reviewDto = reviewMap.get(report.getId());
            ProjectResponse projectResponse = allProjectResponses.getProjectsList().stream()
                    .filter(project -> project.getProjectId() == report.getProject().getId())
                    .findFirst()
                    .orElse(null);
            ProjectResponseDTO projectResponseDTO = new ProjectResponseDTO(
                    projectResponse.getProjectId(),
                    projectResponse.getProjectName(),
                    projectResponse.getProjectDescription()
            );
            return mapper.toReportResponseDTO(report, reviewDto, projectResponseDTO);
        });
    }

    //search all reports by title
    public Page<ReportResponseDTO> searchAllReports(String jwtToken,String title, Pageable pageable) {
        Page<Report> reports = reportRepos.searchAllByTitle(title, pageable);
        List<Long> reportIds = reports.stream().map(Report::getId).collect(Collectors.toList());
        Map<Long, ReviewResponseDTO> reviewMap = reviewRepos.findByReportIds(reportIds)
                .stream().collect(Collectors.toMap(
                        Review::getReportId,
                        review -> mapper.toReviewResponseDTO(review)
                ));

        // get all the project response from gRPC
        AllProjectResponses allProjectResponses = projectManagerGrpcClient.getProjects(jwtToken, reportIds);
        return reports.map(report -> {
            ReviewResponseDTO reviewDto = reviewMap.get(report.getId());
            ProjectResponse projectResponse = allProjectResponses.getProjectsList().stream()
                    .filter(project -> project.getProjectId() == report.getProject().getId())
                    .findFirst()
                    .orElse(null);
            ProjectResponseDTO projectResponseDTO = new ProjectResponseDTO(
                    projectResponse.getProjectId(),
                    projectResponse.getProjectName(),
                    projectResponse.getProjectDescription()
            );
            return mapper.toReportResponseDTO(report, reviewDto, projectResponseDTO);
        });
    }
    //filter all reports by status and date
    public Page<ReportResponseDTO> filterAllReports(String jwtToken,String status, String period, Pageable pageable) {
        Page<Report> reports = reportRepos.filterAllByStatusAndDate(status, period, pageable);
        List<Long> reportIds = reports.stream().map(Report::getId).collect(Collectors.toList());
        Map<Long, ReviewResponseDTO> reviewMap = reviewRepos.findByReportIds(reportIds)
                .stream().collect(Collectors.toMap(
                        Review::getReportId,
                        review -> mapper.toReviewResponseDTO(review)
                ));

        // get all the project response from gRPC
        AllProjectResponses allProjectResponses = projectManagerGrpcClient.getProjects(jwtToken, reportIds);
        return reports.map(report -> {
            ReviewResponseDTO reviewDto = reviewMap.get(report.getId());
            ProjectResponse projectResponse = allProjectResponses.getProjectsList().stream()
                    .filter(project -> project.getProjectId() == report.getProject().getId())
                    .findFirst()
                    .orElse(null);
            ProjectResponseDTO projectResponseDTO = new ProjectResponseDTO(
                    projectResponse.getProjectId(),
                    projectResponse.getProjectName(),
                    projectResponse.getProjectDescription()
            );
            return mapper.toReportResponseDTO(report, reviewDto, projectResponseDTO);
        });
    }
    public GenericStatsDTO getGlobalReportStats() {
        Long total = reportRepos.countAllReports();
        Long pending = reportRepos.countAllByFeedbackStatus("PENDING");
        Long given = reportRepos.countAllByFeedbackStatus("GIVEN");
        Double avgRating = reviewRepos.calculateGlobalAverageRating();

        return new GenericStatsDTO(
            total,
            avgRating != null ? avgRating : 0.0,
            pending,
            given
        );
}






    private Page<ReportResponseDTO> mapReportsWithReviews(Page<Report> reports) {
        List<Long> ids = reports.stream().map(Report::getId).collect(Collectors.toList());
        Map<Long, ReviewResponseDTO> reviewMap = reviewRepos.findByReportIds(ids)
                .stream().collect(Collectors.toMap(
                        Review::getReportId,
                        review -> mapper.toReviewResponseDTO(review)
                ));
        return reports.map(report -> mapper.toReportResponseDTO(report, reviewMap.get(report.getId()),null));
    }
}

