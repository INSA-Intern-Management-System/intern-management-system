package com.example.report_service.dto;

public class ManagerReportStatsDTO {
    private Long totalReports;
    private Long pendingReports;
    private Long reviewedReports;
    private Double averageRating;

    public ManagerReportStatsDTO() {}

    public ManagerReportStatsDTO(Long totalReports, Long pendingReports, Long reviewedReports, Double averageRating) {
        this.totalReports = totalReports;
        this.pendingReports = pendingReports;
        this.reviewedReports = reviewedReports;
        this.averageRating = averageRating;
    }

    public Long getTotalReports() { return totalReports; }
    public void setTotalReports(Long totalReports) { this.totalReports = totalReports; }

    public Long getPendingReports() { return pendingReports; }
    public void setPendingReports(Long pendingReports) { this.pendingReports = pendingReports; }

    public Long getReviewedReports() { return reviewedReports; }
    public void setReviewedReports(Long reviewedReports) { this.reviewedReports = reviewedReports; }

    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
}
