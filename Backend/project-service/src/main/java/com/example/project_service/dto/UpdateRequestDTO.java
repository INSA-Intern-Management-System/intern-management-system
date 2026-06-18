package com.example.project_service.dto;

import com.example.project_service.models.ProjectStatus;
import com.example.project_service.models.MilestoneStatus;
import java.util.List;

public class UpdateRequestDTO {

    private Long projectId; // can be null
    private ProjectStatus projectStatus;

    private List<Long> milestoneIds; // can be empty
    private List<MilestoneStatus> milestoneStatuses;

    // Constructors
    public UpdateRequestDTO() {}

    public UpdateRequestDTO(Long projectId, ProjectStatus projectStatus,
                            List<Long> milestoneIds, List<MilestoneStatus> milestoneStatuses) {
        this.projectId = projectId;
        this.projectStatus = projectStatus;
        this.milestoneIds = milestoneIds;
        this.milestoneStatuses = milestoneStatuses;
    }

    // Getters & Setters
    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public ProjectStatus getProjectStatus() {
        return projectStatus;
    }

    public void setProjectStatus(ProjectStatus projectStatus) {
        this.projectStatus = projectStatus;
    }

    public List<Long> getMilestoneIds() {
        return milestoneIds;
    }

    public void setMilestoneIds(List<Long> milestoneIds) {
        this.milestoneIds = milestoneIds;
    }

    public List<MilestoneStatus> getMilestoneStatuses() {
        return milestoneStatuses;
    }

    public void setMilestoneStatuses(List<MilestoneStatus> milestoneStatuses) {
        this.milestoneStatuses = milestoneStatuses;
    }
}
