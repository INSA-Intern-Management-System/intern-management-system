package com.example.project_service.dto;

public class ProjectMilestoneStatsDTO {
    private Long projectId;
    private Long totalMilestones;
    private Long statusCount;

    public ProjectMilestoneStatsDTO(Long projectId, Long totalMilestones, Long statusCount) {
        this.projectId = projectId;
        this.totalMilestones = totalMilestones;
        this.statusCount = statusCount;
    }

    public Long getProjectId() {
        return projectId;
    }

    public Long getTotalMilestones() {
        return totalMilestones;
    }

    public Long getStatusCount() {
        return statusCount;
    }
}

