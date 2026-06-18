package com.example.userservice.dto;

public class UserPerformanceDTO {

    private Long userId;
    private String fullName;
    private String supervisorName;
    private int attendance;
    private Long totalReports;
    private String lastReviewFeedback;
    private String lastReviewTime; // You can keep it as String or LocalDateTime
    private int lastRating;
    private String grade;
    private String performanceLabel;

    // Default constructor
    public UserPerformanceDTO() {}

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getSupervisorName() {
        return supervisorName;
    }

    public void setSupervisorName(String supervisorName) {
        this.supervisorName = supervisorName;
    }

    public int getAttendance() {
        return attendance;
    }

    public void setAttendance(int attendance) {
        this.attendance = attendance;
    }

    public Long getTotalReports() {
        return totalReports;
    }

    public void setTotalReports(Long totalReports) {
        this.totalReports = totalReports;
    }

    public String getLastReviewFeedback() {
        return lastReviewFeedback;
    }

    public void setLastReviewFeedback(String lastReviewFeedback) {
        this.lastReviewFeedback = lastReviewFeedback;
    }

    public String getLastReviewTime() {
        return lastReviewTime;
    }

    public void setLastReviewTime(String lastReviewTime) {
        this.lastReviewTime = lastReviewTime;
    }

    public int getLastRating() {
        return lastRating;
    }

    public void setLastRating(int lastRating) {
        this.lastRating = lastRating;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    public String getPerformanceLabel() {
        return performanceLabel;
    }

    public void setPerformanceLabel(String performanceLabel) {
        this.performanceLabel = performanceLabel;
    }
}

