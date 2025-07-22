package com.example.project_service.dto;

import com.example.project_service.models.MilestoneStatus;
import java.util.Date;

public class MilestoneRequest {

    private Long projectId;
    private String title;
    private String description;
    private MilestoneStatus status;
    private Date dueDate;

    public MilestoneRequest() {}

    public MilestoneRequest(Long projectId, String title, String description,
                            MilestoneStatus status, Date dueDate) {
        this.projectId = projectId;
        this.title = title;
        this.description = description;
        this.status = status;
        this.dueDate = dueDate;
    }

    // Getters & setters

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public MilestoneStatus getStatus() { return status; }
    public void setStatus(MilestoneStatus status) { this.status = status; }

    public Date getDueDate() { return dueDate; }
    public void setDueDate(Date dueDate) { this.dueDate = dueDate; }
}
