package com.example.report_service.dto;

import java.time.LocalDateTime;

public class ReportResponseDTO {
    private Long id;
    private Long managerId;
    private Long projectId;
    private Long internId;
    private String title;
    private String periodTo;
    private String taskCompleted;
    private String challenges;
    private String nextWeekGoals;
    private LocalDateTime createdAt;
    private ReviewResponseDTO review;
    private ProjectResponseDTO projectResponse;

    public ReportResponseDTO() {}

    public ReportResponseDTO(Long id, Long managerId, Long projectId, Long internId, String title, String periodTo,
                             String taskCompleted, String challenges, String nextWeekGoals, LocalDateTime createdAt,ReviewResponseDTO review,ProjectResponseDTO projectResponse) {
        this.id = id;
        this.managerId = managerId;
        this.projectId = projectId;
        this.internId = internId;
        this.title = title;
        this.periodTo = periodTo;
        this.taskCompleted = taskCompleted;
        this.challenges = challenges;
        this.nextWeekGoals = nextWeekGoals;
        this.createdAt = createdAt;
        this.review = review;
        this.projectResponse = projectResponse;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getManagerId() { return managerId; }
    public void setManagerId(Long managerId) { this.managerId = managerId; }

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    public Long getInternId() { return internId; }
    public void setInternId(Long internId) { this.internId = internId; }

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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public ReviewResponseDTO getReview() { return review; }
    public void setReview(ReviewResponseDTO review) { this.review = review;}

    public ProjectResponseDTO getProjectResponse() { return projectResponse; }
    public void setProjectResponse(ProjectResponseDTO projectResponse) { this.projectResponse = projectResponse;}
}
