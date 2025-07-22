package com.example.project_service.dto;

import java.util.Date;

public class TeamDto {

    private Long id;
    private Long projectId;
    private String name;
    private Long managerId;
    private Date createdAt;
    private Date updatedAt;

    public TeamDto() {
    }

    public TeamDto(Long id, Long projectId, String name, Long managerId, Date createdAt, Date updatedAt) {
        this.id = id;
        this.projectId = projectId;
        this.name = name;
        this.managerId = managerId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Long getManagerId() { return managerId; }
    public void setManagerId(Long managerId) { this.managerId = managerId; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }

    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }
}
