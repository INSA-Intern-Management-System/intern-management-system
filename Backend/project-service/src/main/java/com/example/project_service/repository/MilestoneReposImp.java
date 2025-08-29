package com.example.project_service.repository;

import com.example.project_service.dto.ProjectMilestoneStatsDTO;
import com.example.project_service.models.Milestone;
import com.example.project_service.models.MilestoneStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public class MilestoneReposImp implements MilestoneReposInterface {

    private final MilestoneJpaRepository milestoneJpaRepository;

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
}
