package com.example.report_service.dto;


public class UserReportCountDTO {
    private Long userId;
    private Long reportCount;

    public UserReportCountDTO(Long userId, Long reportCount) {
        this.userId = userId;
        this.reportCount = reportCount;
    }

    public Long getUserId() { return userId; }
    public Long getReportCount() { return reportCount; }
}

