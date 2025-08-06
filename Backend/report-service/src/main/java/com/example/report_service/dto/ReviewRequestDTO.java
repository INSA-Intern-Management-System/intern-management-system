package com.example.report_service.dto;

public class ReviewRequestDTO {
    private Long reportId;
    private String feedback;
    private Integer rating;

    public ReviewRequestDTO() {}

    public ReviewRequestDTO(Long reportId, String feedback, Integer rating) {
        this.reportId = reportId;
        this.feedback = feedback;
        this.rating = rating;
    }

    public Long getReportId() { return reportId; }
    public void setReportId(Long reportId) { this.reportId = reportId; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
}
