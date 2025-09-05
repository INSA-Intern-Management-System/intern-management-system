package com.example.report_service.service;

import com.example.project_service.gRPC.AllProjectResponses;
import com.example.project_service.gRPC.ProjectResponse;
import com.example.report_service.client.ActivityGrpcClient;
import com.example.report_service.client.InternManagerGrpcClient;
import com.example.report_service.client.ProjectManagerGrpcClient;
import com.example.report_service.dto.*;
import com.example.report_service.model.Project;
import com.example.report_service.model.Report;
import com.example.report_service.model.Review;
import com.example.report_service.model.Status;
import com.example.report_service.model.User;
import com.example.report_service.repository.ReportReposInterface;
import com.example.report_service.repository.ReviewReposInterface;
import com.example.userservice.gRPC.MultiUsersResponse;
import com.example.userservice.gRPC.SingleUserResponse;

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
    private final ActivityGrpcClient activityGrpcClient;
    private final MapperService mapper;

    @Autowired
    public ReportService(ReportReposInterface reportRepos,
                         ReviewReposInterface reviewRepos,
                         InternManagerGrpcClient grpcClient,
                         ProjectManagerGrpcClient projectManagerGrpcClient,
                        ActivityGrpcClient activityGrpcClient,
                         MapperService mapper) {
        this.reportRepos = reportRepos;
        this.reviewRepos = reviewRepos;
        this.grpcClient = grpcClient;
        this.projectManagerGrpcClient = projectManagerGrpcClient;
        this.activityGrpcClient = activityGrpcClient;
        this.mapper = mapper;
    }

    @Transactional
    public ReportResponseDTO createReport(String jwtToken, Long userId, ReportRequestDTO dto) {
        System.out.println("Creating report for userId: " + userId);

        // Fetch intern and manager info via gRPC
        var grpcResponse = grpcClient.getInternManagerByUserId(jwtToken, userId);
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

        // Fetch project info from gRPC
        var projectResponse = projectManagerGrpcClient.getProjectInfo(jwtToken, grpcResponse.getProjectId());
        if (projectResponse == null) {
                throw new RuntimeException("Project not found for userId: " + userId);
        }
        ProjectResponseDTO projectResponseDTO = new ProjectResponseDTO(
                projectResponse.getProjectId(),
                projectResponse.getProjectName(),
                projectResponse.getProjectDescription()
        );

        // Fetch intern info for UserDTO
        UserDTO userDTO = null;
        var usersResponse = grpcClient.getAllUsers(jwtToken, List.of(grpcResponse.getUserId()));
        if (usersResponse != null && !usersResponse.getUsersList().isEmpty()) {
                var userResponse = usersResponse.getUsers(0);
                userDTO = new UserDTO(userResponse.getUserId(), userResponse.getFirstName(), userResponse.getLastName());
        }

        // Save the report
        Report saved = reportRepos.saveReport(report);

        // Log activity
        logActivity(jwtToken, userId, "Report Created", "Report created with title: " + dto.getTitle());

        // Map to ReportResponseDTO including project and user info
        return mapper.toReportResponseDTO(saved, null, projectResponseDTO, userDTO);
        }


    @Transactional
    public Page<ReportResponseDTO> getReportsWithReviews(String jwtToken, Long userId, Pageable pageable) {
        // Fetch reports
        Page<Report> reports = reportRepos.findByUserId(userId, pageable);
        System.out.println("Fetched reports for userId: " + userId + ", total reports: " + reports.getTotalElements());

        // Collect report IDs
        List<Long> reportIds = reports.stream().map(Report::getId).collect(Collectors.toList());

        // Collect intern IDs from reports
        List<Long> internIds = reports.stream()
                .map(report -> report.getIntern().getId())
                .distinct()
                .collect(Collectors.toList());

        // Get all users from User gRPC service
        MultiUsersResponse userResponse = grpcClient.getAllUsers(jwtToken, internIds);
        Map<Long, SingleUserResponse> userMap = new HashMap<>();
        if (userResponse != null) {
                for (SingleUserResponse user : userResponse.getUsersList()) {
                userMap.put(user.getUserId(), user);
                }
        }

        // Map reviews by report ID
        Map<Long, ReviewResponseDTO> reviewMap = reviewRepos.findByReportIds(reportIds)
                .stream().collect(Collectors.toMap(
                        review -> review.getReport().getId(),
                        review -> mapper.toReviewResponseDTO(review)
                ));

        // Collect project IDs from reports
        List<Long> projectIds = reports.stream()
                .map(report -> report.getProject().getId())
                .distinct()
                .collect(Collectors.toList());

        System.out.println("Fetching project responses for project IDs: " + projectIds);
        AllProjectResponses allProjectResponses = projectManagerGrpcClient.getProjects(jwtToken, projectIds);
        allProjectResponses.getProjectsList().forEach(project ->
                System.out.println("Fetched project ID: " + project.getProjectId()));

        // Map reports to ReportResponseDTO including review, project, and user info
        return reports.map(report -> {
                ReviewResponseDTO reviewDto = reviewMap.get(report.getId());

                // Map project
                ProjectResponse projectResponse = allProjectResponses.getProjectsList().stream()
                        .filter(project -> project.getProjectId() == report.getProject().getId())
                        .findFirst()
                        .orElse(null);

                ProjectResponseDTO projectResponseDTO = projectResponse != null ?
                        new ProjectResponseDTO(
                                projectResponse.getProjectId(),
                                projectResponse.getProjectName(),
                                projectResponse.getProjectDescription()
                        ) :
                        new ProjectResponseDTO(0L, "UNKNOWN", "UNKNOWN");

                // Map user
                SingleUserResponse user = userMap.get(report.getIntern().getId());
                UserDTO userDTO = user != null ?
                        new UserDTO(user.getUserId(), user.getFirstName(), user.getLastName()) :
                        new UserDTO(0L, "UNKNOWN", "UNKNOWN");

                return mapper.toReportResponseDTO(report, reviewDto, projectResponseDTO, userDTO);
        });
        }
    
    @Transactional
    public Page<ReportResponseDTO> searchReports(String jwtToken, Long userId, String keyword, Pageable pageable) {
        // Fetch reports
        Page<Report> reports = reportRepos.searchByTitleAndFeedback(userId, keyword, pageable);
        if (reports.isEmpty()) {
                return Page.empty(pageable);
        }

        // Map reviews for the reports
        List<Long> reportIds = reports.stream().map(Report::getId).collect(Collectors.toList());
        Map<Long, ReviewResponseDTO> reviewMap = reviewRepos.findByReportIds(reportIds)
                .stream().collect(Collectors.toMap(
                        Review::getReportId,
                        review -> mapper.toReviewResponseDTO(review)
                ));

        // Collect project IDs from the reports
        List<Long> projectIds = reports.stream()
                .map(report -> report.getProject().getId())
                .distinct()
                .collect(Collectors.toList());

        // Fetch project responses from gRPC
        AllProjectResponses allProjectResponses = projectManagerGrpcClient.getProjects(jwtToken, projectIds);

        // Collect intern IDs from reports for User gRPC
        List<Long> internIds = reports.stream()
                .map(report -> report.getIntern().getId())
                .distinct()
                .collect(Collectors.toList());

        // Fetch users from User gRPC
        MultiUsersResponse userResponse =grpcClient.getAllUsers(jwtToken, internIds);
        Map<Long, SingleUserResponse> userMap = new HashMap<>();
        if (userResponse != null) {
                for (SingleUserResponse user : userResponse.getUsersList()) {
                userMap.put(user.getUserId(), user);
                }
        }

        // Map reports to ReportResponseDTO including review, project, and user info
        return reports.map(report -> {
                ReviewResponseDTO reviewDto = reviewMap.get(report.getId());

                // Map project
                ProjectResponse projectResponse = allProjectResponses.getProjectsList().stream()
                        .filter(project -> project.getProjectId() == report.getProject().getId())
                        .findFirst()
                        .orElse(null);

                ProjectResponseDTO projectResponseDTO = projectResponse != null ?
                        new ProjectResponseDTO(
                                projectResponse.getProjectId(),
                                projectResponse.getProjectName(),
                                projectResponse.getProjectDescription()
                        ) :
                        new ProjectResponseDTO(0L, "UNKNOWN", "UNKNOWN");

                // Map user
                SingleUserResponse user = userMap.get(report.getIntern().getId());
                UserDTO userDTO = user != null ?
                        new UserDTO(user.getUserId(), user.getFirstName(), user.getLastName()) :
                        new UserDTO(0L, "UNKNOWN", "UNKNOWN");

                return mapper.toReportResponseDTO(report, reviewDto, projectResponseDTO, userDTO);
        });
        }

    @Transactional
    public Page<ReportResponseDTO> filterReports(String jwtToken, Long userId, String title, String status, String period, Pageable pageable) {
        // Fetch reports with filters
        Page<Report> reports = reportRepos.findReportsByInternAndFilters(userId, title, status, period, pageable);
        if (reports.isEmpty()) {
                return Page.empty(pageable);
        }

        // Map reviews for the reports
        List<Long> reportIds = reports.stream().map(Report::getId).collect(Collectors.toList());
        Map<Long, ReviewResponseDTO> reviewMap = reviewRepos.findByReportIds(reportIds)
                .stream().collect(Collectors.toMap(
                        Review::getReportId,
                        review -> mapper.toReviewResponseDTO(review)
                ));

        // Collect project IDs from the reports
        List<Long> projectIds = reports.stream()
                .map(report -> report.getProject().getId())
                .distinct()
                .collect(Collectors.toList());

        // Fetch project responses from gRPC
        AllProjectResponses allProjectResponses = projectManagerGrpcClient.getProjects(jwtToken, projectIds);

        // Collect intern IDs from reports for User gRPC
        List<Long> internIds = reports.stream()
                .map(report -> report.getIntern().getId())
                .distinct()
                .collect(Collectors.toList());

        // Fetch users from User gRPC
        MultiUsersResponse userResponse = grpcClient.getAllUsers(jwtToken, internIds);
        Map<Long, SingleUserResponse> userMap = new HashMap<>();
        if (userResponse != null) {
                for (SingleUserResponse user : userResponse.getUsersList()) {
                userMap.put(user.getUserId(), user);
                }
        }

        // Map reports to ReportResponseDTO including review, project, and user info
        return reports.map(report -> {
                ReviewResponseDTO reviewDto = reviewMap.get(report.getId());

                // Map project
                ProjectResponse projectResponse = allProjectResponses.getProjectsList().stream()
                        .filter(project -> project.getProjectId() == report.getProject().getId())
                        .findFirst()
                        .orElse(null);

                ProjectResponseDTO projectResponseDTO = projectResponse != null ?
                        new ProjectResponseDTO(
                                projectResponse.getProjectId(),
                                projectResponse.getProjectName(),
                                projectResponse.getProjectDescription()
                        ) :
                        new ProjectResponseDTO(0L, "UNKNOWN", "UNKNOWN");

                // Map user
                SingleUserResponse user = userMap.get(report.getIntern().getId());
                UserDTO userDTO = user != null ?
                        new UserDTO(user.getUserId(), user.getFirstName(), user.getLastName()) :
                        new UserDTO(0L, "UNKNOWN", "UNKNOWN");

                return mapper.toReportResponseDTO(report, reviewDto, projectResponseDTO, userDTO);
        });
        }


    @Transactional
    public Page<ReportResponseDTO> searchMyReports(String jwtToken, Long userId, String title, Pageable pageable) {
        // Fetch reports by intern and title
        Page<Report> reports = reportRepos.findReportsByInternAndTitle(userId, title, pageable);
        if (reports.isEmpty()) {
                return Page.empty(pageable);
        }

        // Map reviews for the reports
        List<Long> reportIds = reports.stream().map(Report::getId).collect(Collectors.toList());
        Map<Long, ReviewResponseDTO> reviewMap = reviewRepos.findByReportIds(reportIds)
                .stream().collect(Collectors.toMap(
                        Review::getReportId,
                        review -> mapper.toReviewResponseDTO(review)
                ));

        // Collect project IDs from the reports
        List<Long> projectIds = reports.stream()
                .map(report -> report.getProject().getId())
                .distinct()
                .collect(Collectors.toList());

        // Fetch project responses from gRPC
        AllProjectResponses allProjectResponses = projectManagerGrpcClient.getProjects(jwtToken, projectIds);

        // Collect intern IDs from reports for User gRPC
        List<Long> internIds = reports.stream()
                .map(report -> report.getIntern().getId())
                .distinct()
                .collect(Collectors.toList());

        // Fetch users from User gRPC
        MultiUsersResponse userResponse = grpcClient.getAllUsers(jwtToken, internIds);
        Map<Long, SingleUserResponse> userMap = new HashMap<>();
        if (userResponse != null) {
                for (SingleUserResponse user : userResponse.getUsersList()) {
                userMap.put(user.getUserId(), user);
                }
        }

        // Map reports to ReportResponseDTO including review, project, and user info
        return reports.map(report -> {
                ReviewResponseDTO reviewDto = reviewMap.get(report.getId());

                // Map project
                ProjectResponse projectResponse = allProjectResponses.getProjectsList().stream()
                        .filter(project -> project.getProjectId() == report.getProject().getId())
                        .findFirst()
                        .orElse(null);

                ProjectResponseDTO projectResponseDTO = projectResponse != null ?
                        new ProjectResponseDTO(
                                projectResponse.getProjectId(),
                                projectResponse.getProjectName(),
                                projectResponse.getProjectDescription()
                        ) :
                        new ProjectResponseDTO(0L, "UNKNOWN", "UNKNOWN");

                // Map user
                SingleUserResponse user = userMap.get(report.getIntern().getId());
                UserDTO userDTO = user != null ?
                        new UserDTO(user.getUserId(), user.getFirstName(), user.getLastName()) :
                        new UserDTO(0L, "UNKNOWN", "UNKNOWN");

                return mapper.toReportResponseDTO(report, reviewDto, projectResponseDTO, userDTO);
        });
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

    @Transactional
    public Page<ReportResponseDTO> searchManagerReports(String jwtToken, Long managerId, String title, Pageable pageable) {
        // Fetch reports by manager and title
        Page<Report> reports = reportRepos.searchByManagerAndTitle(managerId, title, pageable);
        if (reports.isEmpty()) {
                return Page.empty(pageable);
        }

        // Map reviews for the reports
        List<Long> reportIds = reports.stream().map(Report::getId).collect(Collectors.toList());
        Map<Long, ReviewResponseDTO> reviewMap = reviewRepos.findByReportIds(reportIds)
                .stream().collect(Collectors.toMap(
                        Review::getReportId,
                        review -> mapper.toReviewResponseDTO(review)
                ));

        // Collect project IDs from the reports
        List<Long> projectIds = reports.stream()
                .map(report -> report.getProject().getId())
                .distinct()
                .collect(Collectors.toList());

        // Fetch project responses from gRPC
        AllProjectResponses allProjectResponses = projectManagerGrpcClient.getProjects(jwtToken, projectIds);

        // Collect intern IDs for User gRPC
        List<Long> internIds = reports.stream()
                .map(report -> report.getIntern().getId())
                .distinct()
                .collect(Collectors.toList());

        // Fetch users from User gRPC
        MultiUsersResponse userResponse = grpcClient.getAllUsers(jwtToken, internIds);
        Map<Long, SingleUserResponse> userMap = new HashMap<>();
        if (userResponse != null) {
                for (SingleUserResponse user : userResponse.getUsersList()) {
                userMap.put(user.getUserId(), user);
                }
        }

        // Map reports to ReportResponseDTO including review, project, and user info
        return reports.map(report -> {
                ReviewResponseDTO reviewDto = reviewMap.get(report.getId());

                // Map project
                ProjectResponse projectResponse = allProjectResponses.getProjectsList().stream()
                        .filter(project -> project.getProjectId() == report.getProject().getId())
                        .findFirst()
                        .orElse(null);

                ProjectResponseDTO projectResponseDTO = projectResponse != null ?
                        new ProjectResponseDTO(
                                projectResponse.getProjectId(),
                                projectResponse.getProjectName(),
                                projectResponse.getProjectDescription()
                        ) :
                        new ProjectResponseDTO(0L, "UNKNOWN", "UNKNOWN");

                // Map user
                SingleUserResponse user = userMap.get(report.getIntern().getId());
                UserDTO userDTO = user != null ?
                        new UserDTO(user.getUserId(), user.getFirstName(), user.getLastName()) :
                        new UserDTO(0L, "UNKNOWN", "UNKNOWN");

                return mapper.toReportResponseDTO(report, reviewDto, projectResponseDTO, userDTO);
        });
        }


    @Transactional
    public Page<ReportResponseDTO> filterManagerReports(String jwtToken, Long managerId, String title, String status, String period, Pageable pageable) {
        // Fetch reports by manager and filters
        Page<Report> reports = reportRepos.findReportsByManagerAndFilters(managerId, title, status, period, pageable);
        if (reports.isEmpty()) {
                return Page.empty(pageable);
        }

        // Map reviews for the reports
        List<Long> reportIds = reports.stream().map(Report::getId).collect(Collectors.toList());
        Map<Long, ReviewResponseDTO> reviewMap = reviewRepos.findByReportIds(reportIds)
                .stream().collect(Collectors.toMap(
                        Review::getReportId,
                        review -> mapper.toReviewResponseDTO(review)
                ));

        // Collect project IDs from the reports
        List<Long> projectIds = reports.stream()
                .map(report -> report.getProject().getId())
                .distinct()
                .collect(Collectors.toList());

        // Fetch project responses from gRPC
        AllProjectResponses allProjectResponses = projectManagerGrpcClient.getProjects(jwtToken, projectIds);

        // Collect intern IDs for User gRPC
        List<Long> internIds = reports.stream()
                .map(report -> report.getIntern().getId())
                .distinct()
                .collect(Collectors.toList());

        // Fetch users from User gRPC
        MultiUsersResponse userResponse = grpcClient.getAllUsers(jwtToken, internIds);
        Map<Long, SingleUserResponse> userMap = new HashMap<>();
        if (userResponse != null) {
                for (SingleUserResponse user : userResponse.getUsersList()) {
                userMap.put(user.getUserId(), user);
                }
        }

        // Map reports to ReportResponseDTO including review, project, and user info
        return reports.map(report -> {
                ReviewResponseDTO reviewDto = reviewMap.get(report.getId());

                // Map project
                ProjectResponse projectResponse = allProjectResponses.getProjectsList().stream()
                        .filter(project -> project.getProjectId() == report.getProject().getId())
                        .findFirst()
                        .orElse(null);

                ProjectResponseDTO projectResponseDTO = projectResponse != null ?
                        new ProjectResponseDTO(
                                projectResponse.getProjectId(),
                                projectResponse.getProjectName(),
                                projectResponse.getProjectDescription()
                        ) :
                        new ProjectResponseDTO(0L, "UNKNOWN", "UNKNOWN");

                // Map user
                SingleUserResponse user = userMap.get(report.getIntern().getId());
                UserDTO userDTO = user != null ?
                        new UserDTO(user.getUserId(), user.getFirstName(), user.getLastName()) :
                        new UserDTO(0L, "UNKNOWN", "UNKNOWN");

                return mapper.toReportResponseDTO(report, reviewDto, projectResponseDTO, userDTO);
        });
}


     @Transactional
     public Page<ReportResponseDTO> searchManagersReports(String jwtToken, Long managerId, String title, Pageable pageable) {
        // Fetch reports by manager and title
        Page<Report> reports = reportRepos.findReportsByManagerAndTitle(managerId, title, pageable);
        if (reports.isEmpty()) {
                return Page.empty(pageable);
        }

        // Map reviews for the reports
        List<Long> reportIds = reports.stream().map(Report::getId).collect(Collectors.toList());
        Map<Long, ReviewResponseDTO> reviewMap = reviewRepos.findByReportIds(reportIds)
                .stream().collect(Collectors.toMap(
                        Review::getReportId,
                        review -> mapper.toReviewResponseDTO(review)
                ));

        // Collect project IDs from the reports
        List<Long> projectIds = reports.stream()
                .map(report -> report.getProject().getId())
                .distinct()
                .collect(Collectors.toList());

        // Fetch project responses from gRPC
        AllProjectResponses allProjectResponses = projectManagerGrpcClient.getProjects(jwtToken, projectIds);

        // Collect intern IDs for User gRPC
        List<Long> internIds = reports.stream()
                .map(report -> report.getIntern().getId())
                .distinct()
                .collect(Collectors.toList());

        // Fetch users from User gRPC
        MultiUsersResponse userResponse = grpcClient.getAllUsers(jwtToken, internIds);
        Map<Long, SingleUserResponse> userMap = new HashMap<>();
        if (userResponse != null) {
                for (SingleUserResponse user : userResponse.getUsersList()) {
                userMap.put(user.getUserId(), user);
                }
        }

        // Map reports to ReportResponseDTO including review, project, and user info
        return reports.map(report -> {
                ReviewResponseDTO reviewDto = reviewMap.get(report.getId());

                // Map project
                ProjectResponse projectResponse = allProjectResponses.getProjectsList().stream()
                        .filter(project -> project.getProjectId() == report.getProject().getId())
                        .findFirst()
                        .orElse(null);

                ProjectResponseDTO projectResponseDTO = projectResponse != null ?
                        new ProjectResponseDTO(
                                projectResponse.getProjectId(),
                                projectResponse.getProjectName(),
                                projectResponse.getProjectDescription()
                        ) :
                        new ProjectResponseDTO(0L, "UNKNOWN", "UNKNOWN");

                // Map user
                SingleUserResponse user = userMap.get(report.getIntern().getId());
                UserDTO userDTO = user != null ?
                        new UserDTO(user.getUserId(), user.getFirstName(), user.getLastName()) :
                        new UserDTO(0L, "UNKNOWN", "UNKNOWN");

                return mapper.toReportResponseDTO(report, reviewDto, projectResponseDTO, userDTO);
        });
        }


    @Transactional
    public ReportResponseDTO createReview(String authHeader, Long managerId, ReviewRequestDTO dto) {
        // Fetch report
        Report report = reportRepos.getReportById(dto.getReportId())
                .orElseThrow(() -> new RuntimeException("Report not found for ID: " + dto.getReportId()));

        // Check if review already exists
        Review existingReview = reviewRepos.findByReportId(dto.getReportId());
        if (existingReview != null) {
                throw new RuntimeException("Review already exists for report ID: " + dto.getReportId());
        }

        // Create review
        Review review = new Review();
        review.setReport(new Report(dto.getReportId()));
        review.setFeedback(dto.getFeedback());
        review.setRating(dto.getRating());
        review.setCreatedAt(LocalDateTime.now());

        Review saved = reviewRepos.saveReview(review);

        int result = reportRepos.updateFeedbackStatus(report.getId(), Status.GIVEN);
        if (result == 0) {
                throw new RuntimeException("Report with given id: " + report.getId() + " not found");
        }

        // Fetch project response from gRPC
        ProjectResponse projectResponse = projectManagerGrpcClient.getProjectInfo(authHeader, report.getProject().getId());
        if (projectResponse == null) {
                throw new RuntimeException("Project not found for report ID: " + dto.getReportId());
        }

        // Fetch user response from User gRPC (intern of the report)
        SingleUserResponse user = null;
        UserDTO userDTO = null;
        if (report.getIntern() != null) {
                MultiUsersResponse userResponse = grpcClient.getAllUsers(authHeader, List.of(report.getIntern().getId()));
                if (userResponse != null && !userResponse.getUsersList().isEmpty()) {
                user = userResponse.getUsersList().get(0);
                userDTO = new UserDTO(user.getUserId(), user.getFirstName(), user.getLastName());
                }
        }

        // Log activity
        logActivity(authHeader, managerId, "Review Created", "Review created for report ID: " + dto.getReportId());

        ProjectResponseDTO projectResponseDTO = new ProjectResponseDTO(
                projectResponse.getProjectId(),
                projectResponse.getProjectName(),
                projectResponse.getProjectDescription()
        );

        // Map report to ReportResponseDTO including review, project, and user info
        return mapper.toReportResponseDTO(report, mapper.toReviewResponseDTO(saved), projectResponseDTO, userDTO);
        }

    @Transactional
    public Page<ReportResponseDTO> getReportsByManagerId(String authHeader, Long managerId, Pageable pageable) {
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

        // Collect project IDs from the reports
        List<Long> projectIds = reports.stream()
                .map(report -> report.getProject().getId())
                .distinct()
                .collect(Collectors.toList());

        // Fetch all project responses from gRPC
        AllProjectResponses allProjectResponses = projectManagerGrpcClient.getProjects(authHeader, projectIds);

        // Collect intern IDs for fetching user details from User gRPC
        List<Long> internIds = reports.stream()
                .map(report -> report.getIntern().getId())
                .distinct()
                .collect(Collectors.toList());

        Map<Long,SingleUserResponse> userMap = new HashMap<>();
        if (!internIds.isEmpty()) {
                MultiUsersResponse usersResponse = grpcClient.getAllUsers(authHeader, internIds);
                if (usersResponse != null) {
                for (SingleUserResponse user : usersResponse.getUsersList()) {
                        userMap.put(user.getUserId(), user);
                }
                }
        }

        // Map reports to ReportResponseDTO including review, project, and user info
        return reports.map(report -> {
                ReviewResponseDTO reviewDto = reviewMap.get(report.getId());

                ProjectResponse projectResponse = allProjectResponses.getProjectsList().stream()
                        .filter(project -> project.getProjectId() == report.getProject().getId())
                        .findFirst()
                        .orElse(null);

                ProjectResponseDTO projectResponseDTO = null;
                if (projectResponse != null) {
                projectResponseDTO = new ProjectResponseDTO(
                        projectResponse.getProjectId(),
                        projectResponse.getProjectName(),
                        projectResponse.getProjectDescription()
                );
                } else {
                projectResponseDTO = new ProjectResponseDTO(0L, "UNKNOWN", "UNKNOWN");
                }

                SingleUserResponse userResponse = report.getIntern() != null ? userMap.get(report.getIntern().getId()) : null;
                UserDTO userDTO = null;
                if (userResponse != null) {
                userDTO = new UserDTO(userResponse.getUserId(), userResponse.getFirstName(), userResponse.getLastName());
                }

                return mapper.toReportResponseDTO(report, reviewDto, projectResponseDTO, userDTO);
        });
        }


    @Transactional
    public Page<ReportResponseDTO> getAllReportsWithReviews(String jwtToken, Pageable pageable) {
        Page<Report> reports = reportRepos.findAllReports(pageable);

        List<Long> reportIds = reports.stream()
                .map(Report::getId)
                .collect(Collectors.toList());

        Map<Long, ReviewResponseDTO> reviewMap = reviewRepos.findByReportIds(reportIds)
                .stream()
                .collect(Collectors.toMap(
                        Review::getReportId,
                        mapper::toReviewResponseDTO
                ));

        // Collect project IDs from the reports
        List<Long> projectIds = reports.stream()
                .map(report -> report.getProject().getId())
                .distinct()
                .collect(Collectors.toList());

        // Fetch all project responses from gRPC
        AllProjectResponses allProjectResponses = projectManagerGrpcClient.getProjects(jwtToken, projectIds);

        // Collect intern IDs for fetching user details from User gRPC
        List<Long> internIds = reports.stream()
                .map(report -> report.getIntern().getId())
                .distinct()
                .collect(Collectors.toList());

        Map<Long, SingleUserResponse> userMap = new HashMap<>();
        if (!internIds.isEmpty()) {
                MultiUsersResponse usersResponse = grpcClient.getAllUsers(jwtToken, internIds);
                if (usersResponse != null) {
                for (SingleUserResponse user : usersResponse.getUsersList()) {
                        userMap.put(user.getUserId(), user);
                }
                }
        }

        // Map reports to ReportResponseDTO including review, project, and user info
        return reports.map(report -> {
                ReviewResponseDTO reviewDto = reviewMap.get(report.getId());

                ProjectResponse projectResponse = allProjectResponses.getProjectsList().stream()
                        .filter(project -> project.getProjectId() == report.getProject().getId())
                        .findFirst()
                        .orElse(null);

                ProjectResponseDTO projectResponseDTO = null;
                if (projectResponse != null) {
                projectResponseDTO = new ProjectResponseDTO(
                        projectResponse.getProjectId(),
                        projectResponse.getProjectName(),
                        projectResponse.getProjectDescription()
                );
                } else {
                projectResponseDTO = new ProjectResponseDTO(0L, "UNKNOWN", "UNKNOWN");
                }

                SingleUserResponse userResponse = report.getIntern() != null ? userMap.get(report.getIntern().getId()) : null;
                UserDTO userDTO = null;
                if (userResponse != null) {
                userDTO = new UserDTO(userResponse.getUserId(), userResponse.getFirstName(), userResponse.getLastName());
                }

                return mapper.toReportResponseDTO(report, reviewDto, projectResponseDTO, userDTO);
        });
        }

    //search all reports by title
    @Transactional
    public Page<ReportResponseDTO> searchAllReports(String jwtToken, String title, Pageable pageable) {
        Page<Report> reports = reportRepos.searchAllByTitle(title, pageable);

        List<Long> reportIds = reports.stream()
                .map(Report::getId)
                .collect(Collectors.toList());

        Map<Long, ReviewResponseDTO> reviewMap = reviewRepos.findByReportIds(reportIds)
                .stream()
                .collect(Collectors.toMap(
                        Review::getReportId,
                        mapper::toReviewResponseDTO
                ));

        // Collect project IDs from the reports
        List<Long> projectIds = reports.stream()
                .map(report -> report.getProject().getId())
                .distinct()
                .collect(Collectors.toList());

        // Fetch all project responses from gRPC
        AllProjectResponses allProjectResponses = projectManagerGrpcClient.getProjects(jwtToken, projectIds);

        // Collect intern IDs for fetching user details from User gRPC
        List<Long> internIds = reports.stream()
                .map(report -> report.getIntern().getId())
                .distinct()
                .collect(Collectors.toList());

        Map<Long, SingleUserResponse> userMap = new HashMap<>();
        if (!internIds.isEmpty()) {
                MultiUsersResponse usersResponse = grpcClient.getAllUsers(jwtToken, internIds);
                if (usersResponse != null) {
                for (SingleUserResponse user : usersResponse.getUsersList()) {
                        userMap.put(user.getUserId(), user);
                }
                }
        }

        // Map reports to ReportResponseDTO including review, project, and user info
        return reports.map(report -> {
                ReviewResponseDTO reviewDto = reviewMap.get(report.getId());

                ProjectResponse projectResponse = allProjectResponses.getProjectsList().stream()
                        .filter(project -> project.getProjectId() == report.getProject().getId())
                        .findFirst()
                        .orElse(null);

                ProjectResponseDTO projectResponseDTO = null;
                if (projectResponse != null) {
                projectResponseDTO = new ProjectResponseDTO(
                        projectResponse.getProjectId(),
                        projectResponse.getProjectName(),
                        projectResponse.getProjectDescription()
                );
                } else {
                projectResponseDTO = new ProjectResponseDTO(0L, "UNKNOWN", "UNKNOWN");
                }

                SingleUserResponse userResponse = report.getIntern() != null ? userMap.get(report.getIntern().getId()) : null;
                UserDTO userDTO = null;
                if (userResponse != null) {
                userDTO = new UserDTO(userResponse.getUserId(), userResponse.getFirstName(), userResponse.getLastName());
                }

                return mapper.toReportResponseDTO(report, reviewDto, projectResponseDTO, userDTO);
        });
        }

    //filter all reports by status and date
    @Transactional
    public Page<ReportResponseDTO> filterAllReports(String jwtToken, String title, String status, String period, Pageable pageable) {
        Page<Report> reports = reportRepos.findReportsByTitleOrStatusOrDate(title, status, period, pageable);

        List<Long> reportIds = reports.stream()
                .map(Report::getId)
                .collect(Collectors.toList());

        Map<Long, ReviewResponseDTO> reviewMap = reviewRepos.findByReportIds(reportIds)
                .stream()
                .collect(Collectors.toMap(
                        Review::getReportId,
                        mapper::toReviewResponseDTO
                ));

        // Collect project IDs from the reports
        List<Long> projectIds = reports.stream()
                .map(report -> report.getProject().getId())
                .distinct()
                .collect(Collectors.toList());

        // Fetch all project responses from gRPC
        AllProjectResponses allProjectResponses = projectManagerGrpcClient.getProjects(jwtToken, projectIds);

        // Collect intern IDs for fetching user details from User gRPC
        List<Long> internIds = reports.stream()
                .map(report -> report.getIntern().getId())
                .distinct()
                .collect(Collectors.toList());

        Map<Long, SingleUserResponse> userMap = new HashMap<>();
        if (!internIds.isEmpty()) {
                MultiUsersResponse usersResponse = grpcClient.getAllUsers(jwtToken, internIds);
                if (usersResponse != null) {
                for (SingleUserResponse user : usersResponse.getUsersList()) {
                        userMap.put(user.getUserId(), user);
                }
                }
        }

        // Map reports to ReportResponseDTO including review, project, and user info
        return reports.map(report -> {
                ReviewResponseDTO reviewDto = reviewMap.get(report.getId());

                ProjectResponse projectResponse = allProjectResponses.getProjectsList().stream()
                        .filter(project -> project.getProjectId() == report.getProject().getId())
                        .findFirst()
                        .orElse(null);

                ProjectResponseDTO projectResponseDTO;
                if (projectResponse != null) {
                projectResponseDTO = new ProjectResponseDTO(
                        projectResponse.getProjectId(),
                        projectResponse.getProjectName(),
                        projectResponse.getProjectDescription()
                );
                } else {
                projectResponseDTO = new ProjectResponseDTO(0L, "UNKNOWN", "UNKNOWN");
                }

                SingleUserResponse userResponse = report.getIntern() != null ? userMap.get(report.getIntern().getId()) : null;
                UserDTO userDTO = null;
                if (userResponse != null) {
                userDTO = new UserDTO(userResponse.getUserId(), userResponse.getFirstName(), userResponse.getLastName());
                }

                return mapper.toReportResponseDTO(report, reviewDto, projectResponseDTO, userDTO);
        });
        }


    @Transactional
    public Page<ReportResponseDTO> searchHRReports(String jwtToken, String title, Pageable pageable) {
        Page<Report> reports = reportRepos.findReportsByTitle(title, pageable);

        if (reports.isEmpty()) {
                return Page.empty(pageable);
        }

        List<Long> reportIds = reports.stream()
                .map(Report::getId)
                .collect(Collectors.toList());

        // Map reviews
        Map<Long, ReviewResponseDTO> reviewMap = reviewRepos.findByReportIds(reportIds)
                .stream()
                .collect(Collectors.toMap(
                        Review::getReportId,
                        mapper::toReviewResponseDTO
                ));

        // Collect project IDs
        List<Long> projectIds = reports.stream()
                .map(report -> report.getProject().getId())
                .distinct()
                .collect(Collectors.toList());

        // Fetch project responses from gRPC
        AllProjectResponses allProjectResponses = projectManagerGrpcClient.getProjects(jwtToken, projectIds);

        // Collect intern IDs for fetching user details
        List<Long> internIds = reports.stream()
                .map(report -> report.getIntern().getId())
                .distinct()
                .collect(Collectors.toList());

        Map<Long, SingleUserResponse> userMap = new HashMap<>();
        if (!internIds.isEmpty()) {
                MultiUsersResponse usersResponse = grpcClient.getAllUsers(jwtToken, internIds);
                if (usersResponse != null) {
                for (SingleUserResponse user : usersResponse.getUsersList()) {
                        userMap.put(user.getUserId(), user);
                }
                }
        }

        // Map reports to ReportResponseDTO including review, project, and user info
        return reports.map(report -> {
                ReviewResponseDTO reviewDto = reviewMap.get(report.getId());

                ProjectResponse projectResponse = allProjectResponses.getProjectsList().stream()
                        .filter(project -> project.getProjectId() == report.getProject().getId())
                        .findFirst()
                        .orElse(null);

                ProjectResponseDTO projectResponseDTO = projectResponse != null
                        ? new ProjectResponseDTO(projectResponse.getProjectId(), projectResponse.getProjectName(), projectResponse.getProjectDescription())
                        : new ProjectResponseDTO(0L, "UNKNOWN", "UNKNOWN");

                SingleUserResponse userResponse = report.getIntern() != null ? userMap.get(report.getIntern().getId()) : null;
                UserDTO userDTO = null;
                if (userResponse != null) {
                userDTO = new UserDTO(userResponse.getUserId(), userResponse.getFirstName(), userResponse.getLastName());
                }

                return mapper.toReportResponseDTO(report, reviewDto, projectResponseDTO, userDTO);
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
    
    public List<ReviewStatsDTO> getTopInterns(Pageable pageable){
        List<InternRatingProjection> topInterns = reviewRepos.getTopKthInterns(pageable);
        List<ReviewStatsDTO> result = new ArrayList<>();
        for (InternRatingProjection intern : topInterns) {
                ReviewStatsDTO dto = new ReviewStatsDTO();
                dto.setUserID(intern.getInternId());
                dto.setAverageRating(intern.getAverageRating());
                result.add(dto);
        }
        return result;
    }

    public Double calculateAverageRatingForUsers(List<Long> userIds){
        return reviewRepos.calculateAverageRatingForUsers(userIds);
    }



    

    @Transactional
    public UniversityStatsResponseDTO getUniversityStats(List<Long> userIds){
        UniversityStatsResponseDTO result= new UniversityStatsResponseDTO();
        result.setAverageRating(reviewRepos.calculateAverageRatingForUsers(userIds));
        result.setTotalReports(reportRepos.countReportsByUserIds(userIds));
        return result;
    }

        @Transactional
        public List<UserUniversityStatsDTO> getUniversityStatsOfUsers(List<Long> userIds) {

                // 1. Average ratings per user
                List<InternRatingProjection> averageRatings = reviewRepos.calculateAverageRatingsForUsers(userIds);

                // 2. Last review per user
                List<Review> lastReviews = reviewRepos.findLastReviewByUserIds(userIds);

                // 3. Total reports per user
                List<UserReportCountDTO> reportCounts = reportRepos.countReportByUserIds(userIds);

                // 4. Combine results into one DTO per user
                List<UserUniversityStatsDTO> result = new ArrayList<>();

                for (Long userId : userIds) {

                Double avgRating = averageRatings.stream()
                        .filter(r -> r.getInternId().equals(userId))
                        .map(InternRatingProjection::getAverageRating)
                        .findFirst()
                        .orElse(0.0);

                Long totalReports = reportCounts.stream()
                        .filter(r -> r.getUserId().equals(userId))
                        .map(UserReportCountDTO::getReportCount)
                        .findFirst()
                        .orElse(0L);

                Review lastReview = lastReviews.stream()
                        .filter(r -> r.getReport().getIntern().getId().equals(userId))
                        .findFirst()
                        .orElse(null);

                result.add(new UserUniversityStatsDTO(userId, avgRating, totalReports, lastReview));
                }

                return result;
        }

        @Transactional
        public ReportStatsDTO getUniversityStatsOfReport(List<Long> userIds){
                ReportStatsDTO result= new ReportStatsDTO();

                result.setAverageRating(reviewRepos.calculateAverageRatingForUsers(userIds));
                result.setTotalReports(reportRepos.countReportsByUserIds(userIds));

                System.out.print("----------------------->" + result);
                return result;

        }

        @Transactional
        public List<ReportProgressDTO> getReportProgress(List<Long> userIds){
                //get report progress for each users
                List<UserReportCountDTO> rprogress= reportRepos.countReportByUserIds( userIds);
                if (rprogress==null){
                        new RuntimeException("No reports found for users");
                }

                //get review rating for  each users
                List<InternRatingProjection> rating= reviewRepos.calculateAverageRatingsForUsers(userIds);
                if (rating==null){
                        new RuntimeException("No reviews found for users");
                }

                //collect rating and total reports
                Map<Long,Double> mapping =new HashMap<>();
                for(InternRatingProjection r:rating){
                        mapping.put(r.getInternId(),r.getAverageRating());
                }

                //collect into the list and return 
                List<ReportProgressDTO> result = new ArrayList<>();
                for(UserReportCountDTO r:rprogress){
                        if(!mapping.containsKey(r.getUserId())){
                                continue;
                        }
                        result.add(new ReportProgressDTO(r.getUserId(),mapping.get(r.getUserId()),r.getReportCount()));
                }
                return result;

        }





    private Page<ReportResponseDTO> mapReportsWithReviews(Page<Report> reports) {
        List<Long> ids = reports.stream().map(Report::getId).collect(Collectors.toList());
        Map<Long, ReviewResponseDTO> reviewMap = reviewRepos.findByReportIds(ids)
                .stream().collect(Collectors.toMap(
                        Review::getReportId,
                        review -> mapper.toReviewResponseDTO(review)
                ));
        return reports.map(report -> mapper.toReportResponseDTO(report, reviewMap.get(report.getId()),null,null));
    }
     private void logActivity(String jwtToken, Long userId, String action, String description) {
        try {
            activityGrpcClient.createActivity(jwtToken, userId, action, description);
        } catch (Exception e) {
            // Log the failure, but do NOT block business logic
            System.err.println("Failed to log activity: " + e.getMessage());
        }
    }
}

