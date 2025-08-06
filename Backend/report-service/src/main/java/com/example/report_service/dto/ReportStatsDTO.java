package com.example.report_service.dto;

public class ReportStatsDTO {
    private Long totalReports;
    private Double averageRating;

    public ReportStatsDTO() {}

    public ReportStatsDTO(Long totalReports, Double averageRating) {
        this.totalReports = totalReports;
        this.averageRating = averageRating;
    }

    public Long getTotalReports() { return totalReports; }
    public void setTotalReports(Long totalReports) { this.totalReports = totalReports; }

    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
}
