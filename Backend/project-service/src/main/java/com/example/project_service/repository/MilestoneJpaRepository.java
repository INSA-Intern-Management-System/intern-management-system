package com.example.project_service.repository;

import com.example.project_service.dto.ProjectMilestoneStatsDTO;
import com.example.project_service.models.Milestone;
import com.example.project_service.models.MilestoneStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MilestoneJpaRepository extends JpaRepository<Milestone, Long> {

    // Get milestones by project id
    List<Milestone> findByProject_Id(Long projectId);
    List<Milestone> findByProject_IdAndStatusNot(Long projectId, MilestoneStatus status);

    
    @Query("SELECT new com.example.project_service.dto.ProjectMilestoneStatsDTO(" +
       "m.project.id, COUNT(m), SUM(CASE WHEN m.status = :status THEN 1 ELSE 0 END)) " +
       "FROM Milestone m " +
       "WHERE m.project.id IN :projectIds " +
       "GROUP BY m.project.id")
    List<ProjectMilestoneStatsDTO> findMilestoneStatsByProjectsAndStatus(@Param("projectIds") List<Long> projectIds,
                                                                     @Param("status") MilestoneStatus status);


    
}