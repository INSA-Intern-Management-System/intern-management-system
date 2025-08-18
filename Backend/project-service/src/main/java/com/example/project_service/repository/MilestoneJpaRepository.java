package com.example.project_service.repository;

import com.example.project_service.models.Milestone;
import com.example.project_service.models.MilestoneStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MilestoneJpaRepository extends JpaRepository<Milestone, Long> {

    // Get milestones by project id
    List<Milestone> findByProject_Id(Long projectId);
    List<Milestone> findByProject_IdAndStatusNot(Long projectId, MilestoneStatus status);
}
