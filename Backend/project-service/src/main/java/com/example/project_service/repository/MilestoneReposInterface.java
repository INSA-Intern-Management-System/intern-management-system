package com.example.project_service.repository;

import com.example.project_service.models.Milestone;
import com.example.project_service.models.MilestoneStatus;

import java.util.List;
import java.util.Optional;

public interface MilestoneReposInterface {

    // Add milestone
    Milestone addMilestone(Milestone milestone);

    // Remove milestone by ID
    void removeMilestoneById(Long milestoneId);

    // Update milestone status
    Milestone updateMilestoneStatus(Long milestoneId, MilestoneStatus newStatus);

    // Get milestones by project ID
    List<Milestone> getMilestonesByProjectId(Long projectId);

    // Get milestone by ID
    Optional<Milestone> getMilestoneById(Long milestoneId);

    // get milestone by execpt compelted status 
    List<Milestone> getMilestonesByProjectIdExceptCompleted(Long projectId);
}
