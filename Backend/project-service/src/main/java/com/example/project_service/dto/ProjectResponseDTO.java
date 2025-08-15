package com.example.project_service.dto;

import com.example.project_service.models.Project;

public class ProjectResponseDTO {
    private Long projectID;
    private String projectName;
    private String projectDescription;

    ProjectResponseDTO() {
    }
    public ProjectResponseDTO(Long projectID, String projectName, String projectDescription) {
        this.projectID = projectID;
        this.projectName = projectName;
        this.projectDescription = projectDescription;
    }
    public ProjectResponseDTO(Project project) {
        this.projectID = project.getId();
        this.projectName = project.getName();
        this.projectDescription = project.getDescription();
    }
    public Long getProjectID() {
        return projectID;
    }
    public void setProjectID(Long projectID) {
        this.projectID = projectID;
    }
    public String getProjectName() {
        return projectName;
    }
    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }
    public String getProjectDescription() {
        return projectDescription;
    }
    public void setProjectDescription(String projectDescription) {
        this.projectDescription = projectDescription;
    }
}
