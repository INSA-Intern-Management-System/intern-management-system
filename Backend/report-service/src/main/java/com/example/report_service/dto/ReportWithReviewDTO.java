package com.example.report_service.dto;

import java.time.LocalDateTime;

public class ReportWithReviewDTO {
    private Long id;
    private Long internId;
    private Long managerId;
    private Long projectId;
    private String title;
    private String periodTo;
    private String taskCompleted;
    private String challenges;
    private String nextWeekGoals;
    private String feedbackStatus;
    private LocalDateTime createdAt;

    private Long reviewId;
    private String feedback;
    private Integer rating;
    private LocalDateTime reviewCreatedAt;

    public ReportWithReviewDTO() {}

    public ReportWithReviewDTO(Long id, Long internId, Long managerId, Long projectId,
                               String title, String periodTo, String taskCompleted, String challenges,
                               String nextWeekGoals, String feedbackStatus, LocalDateTime createdAt,
                               Long reviewId, String feedback, Integer rating, LocalDateTime reviewCreatedAt) {
        this.id = id;
        this.internId = internId;
        this.managerId = managerId;
        this.projectId = projectId;
        this.title = title;
        this.periodTo = periodTo;
        this.taskCompleted = taskCompleted;
        this.challenges = challenges;
        this.nextWeekGoals = nextWeekGoals;
        this.feedbackStatus = feedbackStatus;
        this.createdAt = createdAt;
        this.reviewId = reviewId;
        this.feedback = feedback;
        this.rating = rating;
        this.reviewCreatedAt = reviewCreatedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getInternId() { return internId; }
    public void setInternId(Long internId) { this.internId = internId; }

    public Long getManagerId() { return managerId; }
    public void setManagerId(Long managerId) { this.managerId = managerId; }

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getPeriodTo() { return periodTo; }
    public void setPeriodTo(String periodTo) { this.periodTo = periodTo; }

    public String getTaskCompleted() { return taskCompleted; }
    public void setTaskCompleted(String taskCompleted) { this.taskCompleted = taskCompleted; }

    public String getChallenges() { return challenges; }
    public void setChallenges(String challenges) { this.challenges = challenges; }

    public String getNextWeekGoals() { return nextWeekGoals; }
    public void setNextWeekGoals(String nextWeekGoals) { this.nextWeekGoals = nextWeekGoals; }

    public String getFeedbackStatus() { return feedbackStatus; }
    public void setFeedbackStatus(String feedbackStatus) { this.feedbackStatus = feedbackStatus; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Long getReviewId() { return reviewId; }
    public void setReviewId(Long reviewId) { this.reviewId = reviewId; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public LocalDateTime getReviewCreatedAt() { return reviewCreatedAt; }
    public void setReviewCreatedAt(LocalDateTime reviewCreatedAt) { this.reviewCreatedAt = reviewCreatedAt; }
}
