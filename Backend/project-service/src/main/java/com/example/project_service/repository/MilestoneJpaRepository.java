package com.example.project_service.repository;

import com.example.project_service.dto.ProjectMilestoneStatsDTO;
import com.example.project_service.models.Milestone;
import com.example.project_service.models.MilestoneStatus;

import jakarta.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MilestoneJpaRepository extends JpaRepository<Milestone, Long> {

    // Get milestones by project id
    List<Milestone> findByProject_Id(Long projectId);
    List<Milestone> findByProject_IdAndStatusNot(Long projectId, MilestoneStatus status);
    List<Milestone> findByIdIn(List<Long> milestoneIds);

    
    @Query("SELECT new com.example.project_service.dto.ProjectMilestoneStatsDTO(" +
       "m.project.id, COUNT(m), SUM(CASE WHEN m.status = :status THEN 1 ELSE 0 END)) " +
       "FROM Milestone m " +
       "WHERE m.project.id IN :projectIds " +
       "GROUP BY m.project.id")
    List<ProjectMilestoneStatsDTO> findMilestoneStatsByProjectsAndStatus(@Param("projectIds") List<Long> projectIds,
                                                                     @Param("status") MilestoneStatus status);
    @Modifying
    @Transactional
    @Query("UPDATE Milestone m SET m.status = :status WHERE m.id IN :milestoneIds")
    int updateStatusByIds(@Param("milestoneIds") List<Long> milestoneIds, 
                          @Param("status") MilestoneStatus status);

      // Count milestones by project ids and status
    @Query("SELECT COUNT(m) FROM Milestone m WHERE m.project.id IN :projectIds AND m.status = :status")
    Long countByProjectIdsAndStatus(@Param("projectIds") List<Long> projectIds,
                                    @Param("status") MilestoneStatus status);

    // Count all milestones for given project ids (ignores status)
    @Query("SELECT COUNT(m) FROM Milestone m WHERE m.project.id IN :projectIds")
    Long countByProjectIds(@Param("projectIds") List<Long> projectIds);


    
}