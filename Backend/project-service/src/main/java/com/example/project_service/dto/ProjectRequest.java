package com.example.project_service.dto;

import com.example.project_service.models.ProjectStatus;
import java.util.Date;
import java.util.List;

public class ProjectRequest {

    private String name;
    private String description;
    private ProjectStatus status;
    private Date startDate;
    private Date endDate;
    private Double budget;
    private List<String> technologies;

    public ProjectRequest() {
    }

    public ProjectRequest(String name, String description, ProjectStatus status,
                          Date startDate, Date endDate, Double budget, List<String> technologies) {
        this.name = name;
        this.description = description;
        this.status = status;
        this.startDate = startDate;
        this.endDate = endDate;
        this.budget = budget;
        this.technologies = technologies;
    }

    // Getters and setters...

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ProjectStatus getStatus() {
        return status;
    }

    public void setStatus(ProjectStatus status) {
        this.status = status;
    }

    public Date getStartDate() {
        return startDate;
    }

    public void setStartDate(Date startDate) {
        this.startDate = startDate;
    }

    public Date getEndDate() {
        return endDate;
    }

    public void setEndDate(Date endDate) {
        this.endDate = endDate;
    }

    public Double getBudget() {
        return budget;
    }

    public void setBudget(Double budget) {
        this.budget = budget;
    }

    public List<String> getTechnologies() {
        return technologies;
    }

    public void setTechnologies(List<String> technologies) {
        this.technologies = technologies;
    }
}
