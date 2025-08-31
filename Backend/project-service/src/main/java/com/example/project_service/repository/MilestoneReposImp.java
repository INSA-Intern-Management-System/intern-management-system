package com.example.project_service.repository;

import com.example.project_service.dto.ProjectMilestoneStatsDTO;
import com.example.project_service.dto.UniversityStatsResponseDTO;
import com.example.project_service.models.Milestone;
import com.example.project_service.models.MilestoneStatus;

import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import org.springframework.data.repository.query.Param;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public class MilestoneReposImp implements MilestoneReposInterface {

    private final MilestoneJpaRepository milestoneJpaRepository;

    @Autowired
    private EntityManager entityManager;

    @Autowired
    public MilestoneReposImp(MilestoneJpaRepository milestoneJpaRepository) {
        this.milestoneJpaRepository = milestoneJpaRepository;
    }

    @Override
    public Milestone addMilestone(Milestone milestone) {
        milestone.setCreatedAt(new Date());
        milestone.setUpdatedAt(new Date());
        return milestoneJpaRepository.save(milestone);
    }

    @Override
    public void removeMilestoneById(Long milestoneId) {
        milestoneJpaRepository.deleteById(milestoneId);
    }

    @Override
    public Milestone updateMilestoneStatus(Long milestoneId, MilestoneStatus newStatus) {
        Optional<Milestone> milestoneOpt = milestoneJpaRepository.findById(milestoneId);
        if (milestoneOpt.isPresent()) {
            Milestone milestone = milestoneOpt.get();
            milestone.setStatus(newStatus);
            milestone.setUpdatedAt(new Date());
            return milestoneJpaRepository.save(milestone);
        } else {
            throw new RuntimeException("Milestone not found with ID: " + milestoneId);
        }
    }

    @Override
    public List<Milestone> getMilestonesByProjectId(Long projectId) {
        return milestoneJpaRepository.findByProject_Id(projectId);
    }

    @Override
    public Optional<Milestone> getMilestoneById(Long milestoneId) {
        return milestoneJpaRepository.findById(milestoneId);
    }

    @Override
    public List<Milestone> getMilestonesByProjectIdExceptCompleted(Long projectId) {
        return milestoneJpaRepository.findByProject_IdAndStatusNot(projectId, MilestoneStatus.COMPLETED);
    }
    @Override
    public List<ProjectMilestoneStatsDTO> findMilestoneStatsByProjectsAndStatus(List<Long> projectIds, MilestoneStatus status) {
        return milestoneJpaRepository.findMilestoneStatsByProjectsAndStatus(projectIds, status);
    }

    @Override
    @Transactional
    public  List<Milestone> findByIdIn(List<Long> milestoneIds){
        return milestoneJpaRepository.findByIdIn(milestoneIds);
    }

    @Override
    @Transactional
    public Long countByProjectIds(@Param("projectIds") List<Long> projectIds){
        return milestoneJpaRepository.countByProjectIds(projectIds);
    }

    @Override
    @Transactional
    public Long countByProjectIdsAndStatus(@Param("projectIds") List<Long> projectIds,@Param("status") MilestoneStatus status){
        return milestoneJpaRepository.countByProjectIdsAndStatus(projectIds,status);


    }
    @Override
    @Transactional
    public UniversityStatsResponseDTO getUniversityStats(@Param("projectIds") List<Long> projectIds,@Param("status") MilestoneStatus status){
        UniversityStatsResponseDTO result=new UniversityStatsResponseDTO(null, null);
        result.setWithStatus(countByProjectIds(projectIds));
        result.setWithOutStatus(countByProjectIdsAndStatus(projectIds,status));
        return result;
    }

    @Override
    @Transactional
    public void updateStatuses(List<Long> milestoneIds, List<MilestoneStatus> statuses) {
        if (milestoneIds.size() != statuses.size()) {
            throw new IllegalArgumentException("IDs and statuses size must match");
        }

        for (int i = 0; i < milestoneIds.size(); i++) {
            try {
                Milestone milestone = entityManager.find(Milestone.class, milestoneIds.get(i));
                if (milestone != null) {
                    milestone.setStatus(statuses.get(i));
                }
            } catch (Exception e) {
                // Log the error for this milestone and continue
                System.err.println("Failed to update milestone ID " + milestoneIds.get(i) + ": " + e.getMessage());
            }

            if (i % 50 == 0) { // flush in batches
                entityManager.flush();
                entityManager.clear();
            }
        }
    }


}
