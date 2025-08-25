package com.example.report_service.dto;


public class ReviewStatsDTO {
    private Long user_id;
    private Double averageRating;

    public ReviewStatsDTO() {}

    public ReviewStatsDTO(Long user_id, Double averageRating) {
        this.user_id = user_id;
        this.averageRating = averageRating;
    }

    public Long getUserID() { return user_id; }
    public void setUserID(Long totalReports) { this.user_id = totalReports; }

    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
}

