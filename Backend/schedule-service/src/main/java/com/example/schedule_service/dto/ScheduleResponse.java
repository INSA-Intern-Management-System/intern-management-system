package com.example.schedule_service.dto;
import java.util.Date;

import com.example.schedule_service.model.ScheduleStatus;

public class ScheduleResponse {

    private Long scheduleId;
    private Long userId;
    private String title;
    private String description;
    private Date dueDate;
    private ScheduleStatus status;
    private Date createdAt;

    public ScheduleResponse() {
    }

    public ScheduleResponse(Long scheduleId, Long userId, String title, String description,
                            Date due, ScheduleStatus status, Date createdAt) {
        this.scheduleId = scheduleId;
        this.userId = userId;
        this.title = title;
        this.description = description;
        this.dueDate = due;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Long getScheduleId() {
        return scheduleId;
    }

    public void setScheduleId(Long scheduleId) {
        this.scheduleId = scheduleId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
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

    public ScheduleStatus getStatus() {
        return status;
    }

    public void setStatus(ScheduleStatus status) {
        this.status = status;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
}
