package com.example.userservice.dto;


public class ReportProgressDTO {
    private Long internId;
    private Long totalReports;
    private Double averageRating;

    public ReportProgressDTO() {}

    public ReportProgressDTO(Long totalReports, Double averageRating,Long internId) {
        this.totalReports = totalReports;
        this.averageRating = averageRating;
        this.internId=internId;
    }

    public Long getTotalReports() { return totalReports; }
    public void setTotalReports(Long totalReports) { this.totalReports = totalReports; }

    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
    public Long getInternId() { return internId; }
    public void setInternId(Long internId) { this.internId = internId; }
}


