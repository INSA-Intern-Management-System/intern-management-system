package com.example.report_service.dto;

public class UniversityStatsResponseDTO {
    private Long totalReports;
    private Double averageRating;

    public UniversityStatsResponseDTO() {
    }

    public UniversityStatsResponseDTO(Long reports, Double rating) {
        this.totalReports = reports;
        this.averageRating = rating;
    }
    public void setTotalReports(Long totalReports) {
        this.totalReports = totalReports;
    }
    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public Long getTotalReports() {
        return totalReports;
    }
    public Double getAverageRating(){
        return averageRating;
    
    }
}

