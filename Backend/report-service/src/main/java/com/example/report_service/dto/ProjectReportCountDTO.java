package com.example.report_service.dto;
public class ProjectReportCountDTO {
    private Long projectId;
    private Long reportCount;

    public ProjectReportCountDTO(Long projectId, Long reportCount) {
        this.projectId = projectId;
        this.reportCount = reportCount;
    }

    public Long getProjectId() {
        return projectId;
    }

    public Long getReportCount() {
        return reportCount;
    }
}
