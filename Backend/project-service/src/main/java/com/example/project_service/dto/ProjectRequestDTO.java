package com.example.project_service.dto;

public class ProjectRequestDTO {
    private Long projectID;

    ProjectRequestDTO() {
    }
    public ProjectRequestDTO(Long projectID) {
        this.projectID = projectID;
    }
    public Long getProjectID() {
        return projectID;
    }
    public void setProjectID(Long projectID) {
        this.projectID = projectID;
    }
}
