package com.example.report_service.dto;

import com.example.report_service.model.Review;

public class UserUniversityStatsDTO {

    private Long userId;
    private Double averageRating;
    private Long totalReports;
    private Review lastReview; // optional, can store just ID or full object

    public UserUniversityStatsDTO(Long userId, Double averageRating, Long totalReports, Review lastReview) {
        this.userId = userId;
        this.averageRating = averageRating;
        this.totalReports = totalReports;
        this.lastReview = lastReview;
    }

    public Long getUserId() { return userId; }
    public Double getAverageRating() { return averageRating; }
    public Long getTotalReports() { return totalReports; }
    public Review getLastReview() { return lastReview; }

    public void setUserId(Long userId) { this.userId = userId; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
    public void setTotalReports(Long totalReports) { this.totalReports = totalReports; }
    public void setLastReview(Review lastReview) { this.lastReview = lastReview; }
}

