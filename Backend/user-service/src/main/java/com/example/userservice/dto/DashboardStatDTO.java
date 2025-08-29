package com.example.userservice.dto;

public class DashboardStatDTO {

    private long totalReports;
    private double averageRating;
    private double score;        // e.g., completed/total milestones
    private int attendance;      // mocked or real attendance percentage

    // Constructors
    public DashboardStatDTO() {}

    public DashboardStatDTO(long totalReports, double averageRating, double score, int attendance) {
        this.totalReports = totalReports;
        this.averageRating = averageRating;
        this.score = score;
        this.attendance = attendance;
    }

    // Getters and Setters
    public long getTotalReports() {
        return totalReports;
    }

    public void setTotalReports(long totalReports) {
        this.totalReports = totalReports;
    }

    public double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(double averageRating) {
        this.averageRating = averageRating;
    }

    public double getScore() {
        return score;
    }

    public void setScore(double score) {
        this.score = score;
    }

    public int getAttendance() {
        return attendance;
    }

    public void setAttendance(int attendance) {
        this.attendance = attendance;
    }

    @Override
    public String toString() {
        return "DashboardStatDTO{" +
                "totalReports=" + totalReports +
                ", averageRating=" + averageRating +
                ", score=" + score +
                ", attendance=" + attendance +
                '}';
    }
}
