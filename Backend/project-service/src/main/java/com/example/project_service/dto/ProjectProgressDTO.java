package com.example.project_service.dto;

import com.example.project_service.models.Project;

public class ProjectProgressDTO {
    private Long projectID;
    private String projectName;
    private String projectDescription;
    private Long progress;

    public ProjectProgressDTO() {
    }
    public ProjectProgressDTO(Long projectID, String projectName, String projectDescription,Long progress) {
        this.projectID = projectID;
        this.projectName = projectName;
        this.projectDescription = projectDescription;
        this.progress=progress;
    }
    public ProjectProgressDTO(Project project) {
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

    public Long getProgress(){
        return progress;
    }
    public void setProgress(Long progress){
        this.progress=progress;
    }
}
