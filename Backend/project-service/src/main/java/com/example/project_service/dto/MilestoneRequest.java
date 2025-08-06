package com.example.project_service.dto;

import com.example.project_service.models.MilestoneStatus;
import jakarta.validation.constraints.*;

import java.util.Date;

public class MilestoneRequest {

    @NotNull(message = "Project ID must not be null")
    private Long projectId;

    @NotBlank(message = "Title must not be blank")
    @Size(max = 100, message = "Title must not exceed 100 characters")
    private String title;

    @NotBlank(message = "Description must not be blank")
    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @NotNull(message = "Status must not be null")
    private MilestoneStatus status;

    @FutureOrPresent(message = "Due date must be today or in the future")
    private Date dueDate;

    public MilestoneRequest() {
        this.status = MilestoneStatus.PENDING; 
    }

    public MilestoneRequest(Long projectId, String title, String description,
                            MilestoneStatus status, Date dueDate) {
        this.projectId = projectId;
        this.title = title;
        this.description = description;
        this.status = status != null ? status : MilestoneStatus.PENDING; 
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
