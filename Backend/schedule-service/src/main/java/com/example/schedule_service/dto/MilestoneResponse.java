package com.example.schedule_service.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;

import com.example.project_service.gRPC.MilestoneStatusProto;

public class MilestoneResponse {

    private Long id;
    private String title;
    private String description;
    private MilestoneStatusProto status;
    private LocalDateTime dueDate;
    private LocalDateTime createdAt;

    public MilestoneResponse() {}

    public MilestoneResponse(Long id, String title, String description,
                             MilestoneStatusProto status, LocalDateTime dueDate, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.status = status;
        this.dueDate = dueDate;
        this.createdAt = createdAt;
    }

    // Getters & setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public MilestoneStatusProto getStatus() { return status; }
    public void setStatus(MilestoneStatusProto status) { this.status = status; }

    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

}


