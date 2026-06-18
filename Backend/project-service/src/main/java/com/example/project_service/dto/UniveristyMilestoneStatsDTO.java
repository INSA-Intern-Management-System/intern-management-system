package com.example.project_service.dto;

public class UniveristyMilestoneStatsDTO {
    private Long totalMilestones;
    private Long statusCount;

    public UniveristyMilestoneStatsDTO(Long totalMilestones, Long statusCount) {
        this.totalMilestones = totalMilestones;
        this.statusCount = statusCount;
    }

    public void setTotalMilestones(Long totalMilestones) {
        this.totalMilestones = totalMilestones;
    }

    public void setStatusCount(Long statusCount) {
        this.statusCount = statusCount;
    }
    public Long getTotalMilestones() {
        return totalMilestones;
    }

    public Long getStatusCount() {
        return statusCount;
    }
}

