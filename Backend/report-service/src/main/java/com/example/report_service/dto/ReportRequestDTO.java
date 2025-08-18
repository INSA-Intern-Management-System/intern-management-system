package com.example.report_service.dto;

public class ReportRequestDTO {
    private String title;
    private String periodTo;
    private String taskCompleted;
    private String challenges;
    private String nextWeekGoals;

    public ReportRequestDTO() {}

    public ReportRequestDTO(String title, String periodTo, String taskCompleted, String challenges, String nextWeekGoals) {
        this.title = title;
        this.periodTo = periodTo;
        this.taskCompleted = taskCompleted;
        this.challenges = challenges;
        this.nextWeekGoals = nextWeekGoals;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getPeriodTo() { return periodTo; }
    public void setPeriodTo(String periodTo) { this.periodTo = periodTo; }

    public String getTaskCompleted() { return taskCompleted; }
    public void setTaskCompleted(String taskCompleted) { this.taskCompleted = taskCompleted; }

    public String getChallenges() { return challenges; }
    public void setChallenges(String challenges) { this.challenges = challenges; }

    public String getNextWeekGoals() { return nextWeekGoals; }
    public void setNextWeekGoals(String nextWeekGoals) { this.nextWeekGoals = nextWeekGoals; }
}
