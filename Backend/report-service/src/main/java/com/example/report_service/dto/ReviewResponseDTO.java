package com.example.report_service.dto;

import java.time.LocalDateTime;

public class ReviewResponseDTO {
    private Long id;
    private Long reportId;
    private String feedback;
    private Integer rating;
    private LocalDateTime createdAt;

    public ReviewResponseDTO() {}

    public ReviewResponseDTO(Long id, Long reportId, String feedback, Integer rating, LocalDateTime createdAt) {
        this.id = id;
        this.reportId = reportId;
        this.feedback = feedback;
        this.rating = rating;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getReportId() { return reportId; }
    public void setReportId(Long reportId) { this.reportId = reportId; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
