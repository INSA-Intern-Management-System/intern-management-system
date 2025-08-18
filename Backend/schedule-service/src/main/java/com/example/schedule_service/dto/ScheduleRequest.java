package com.example.schedule_service.dto;

import java.util.Date;

public class ScheduleRequest {

    private String title;
    private String description;
    private Date dueDate;

    public ScheduleRequest() {
    }

    public ScheduleRequest(String title, String description, Date due) {
        this.title = title;
        this.description = description;
        this.dueDate = due;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Date getDueDate() {
        return dueDate;
    }

    public void setDueDate(Date due) {
        this.dueDate = due;
    }
}
