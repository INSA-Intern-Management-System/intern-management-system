package com.example.project_service.repository;

import com.example.project_service.models.Milestone;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MilestoneJpaRepository extends JpaRepository<Milestone, Long> {

    // Get milestones by project id
    List<Milestone> findByProject_Id(Long projectId);
}
