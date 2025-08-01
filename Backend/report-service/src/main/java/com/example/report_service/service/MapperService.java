package com.example.report_service.service;
import com.example.project_service.gRPC.ProjectResponse;
import com.example.report_service.dto.*;
import com.example.report_service.model.Project;
import com.example.report_service.model.Report;
import com.example.report_service.model.Review;
import com.example.report_service.model.User;

import org.springframework.stereotype.Service;

@Service
public class MapperService {

    public ReportResponseDTO toReportResponseDTO(Report report, ReviewResponseDTO reviewDto,ProjectResponseDTO projectResponse) {
        return new ReportResponseDTO(
                report.getId(),
                report.getManager().getId(),
                report.getProject().getId(),
                report.getIntern().getId(),
                report.getTitle(),
                report.getPeriodTo(),
                report.getTaskCompleted(),
                report.getChallenges(),
                report.getNextWeekGoals(),
                report.getCreatedAt(),
                reviewDto,
                projectResponse
        );
    }

    public ReviewResponseDTO toReviewResponseDTO(Review review) {
        if (review == null) return null;
        return new ReviewResponseDTO(
                review.getId(),
                review.getReport().getId(),
                review.getFeedback(),
                review.getRating(),
                review.getCreatedAt()
        );
    }

    public ReportWithReviewDTO toReportWithReviewDTO(Report report, Review review) {
        Long reviewId = (review != null) ? review.getId() : null;
        String feedback = (review != null) ? review.getFeedback() : null;
        Integer rating = (review != null) ? review.getRating() : null;
        java.time.LocalDateTime reviewCreatedAt = (review != null) ? review.getCreatedAt() : null;

        return new ReportWithReviewDTO(
                report.getId(),
                report.getIntern().getId(),
                report.getManager().getId(),
                report.getProject().getId(),
                report.getTitle(),
                report.getPeriodTo(),
                report.getTaskCompleted(),
                report.getChallenges(),
                report.getNextWeekGoals(),
                report.getFeedbackStatus().toString(),
                report.getCreatedAt(),
                reviewId,
                feedback,
                rating,
                reviewCreatedAt
        );
    }

    public Report toReportEntity(ReportRequestDTO dto, Long internId, Long managerId, Long projectId) {
        Report report = new Report();
        report.setIntern(new User(internId));
        report.setManager(new User(managerId));
        report.setProject(new Project(projectId));
        report.setTitle(dto.getTitle());
        report.setPeriodTo(dto.getPeriodTo());
        report.setTaskCompleted(dto.getTaskCompleted());
        report.setChallenges(dto.getChallenges());
        report.setNextWeekGoals(dto.getNextWeekGoals());
        report.setFeedbackStatus(com.example.report_service.model.Status.PENDING);
        return report;
    }

    public Review toReviewEntity(ReviewRequestDTO dto, Report report) {
        Review review = new Review();
        review.setReport(report);
        review.setFeedback(dto.getFeedback());
        review.setRating(dto.getRating());
        return review;
    }
}

