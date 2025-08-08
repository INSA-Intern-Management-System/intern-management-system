package com.example.report_service.dto;


public class GenericStatsDTO {

    private Long totalReports;
    private Double averageRating;
    private Long pendingReports;
    private Long givenReports;

    public GenericStatsDTO() {
    }

    public GenericStatsDTO(Long totalReports, Double averageRating, Long pendingReports, Long givenReports) {
        this.totalReports = totalReports;
        this.averageRating = averageRating;
        this.pendingReports = pendingReports;
        this.givenReports = givenReports;
    }

    public Long getTotalReports() {
        return totalReports;
    }

    public void setTotalReports(Long totalReports) {
        this.totalReports = totalReports;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public Long getPendingReports() {
        return pendingReports;
    }

    public void setPendingReports(Long pendingReports) {
        this.pendingReports = pendingReports;
    }

    public Long getGivenReports() {
        return givenReports;
    }

    public void setGivenReports(Long givenReports) {
        this.givenReports = givenReports;
    }
}
