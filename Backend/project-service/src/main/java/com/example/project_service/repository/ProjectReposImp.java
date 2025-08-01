package com.example.project_service.repository;

import com.example.project_service.models.Project;
import com.example.project_service.models.ProjectStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;

@Repository
public class ProjectReposImp implements ProjectReposInterface {

    private final ProjectJpaRepository projectJpaRepository;
    private final TeamJpaRepository teamJpaRepository;
    private final MilestoneJpaRepository milestoneJpaRepository;

    @Autowired
    public ProjectReposImp(ProjectJpaRepository projectJpaRepository,
                           TeamJpaRepository teamJpaRepository,
                           MilestoneJpaRepository milestoneJpaRepository) {
        this.projectJpaRepository = projectJpaRepository;
        this.teamJpaRepository = teamJpaRepository;
        this.milestoneJpaRepository = milestoneJpaRepository;
    }

    @Override
    public Project createProject(Project project) {
        return projectJpaRepository.save(project);
    }

    @Override
    public Optional<Project> getProjectById(Long id) {
        return projectJpaRepository.findById(id);
    }

    @Override
    public Page<Project> getAllProjects(Pageable pageable) {
        return projectJpaRepository.findAll(pageable);
    }

    @Override
    public Page<Project> getProjectsByCreator(Long createdById, Pageable pageable) {
        return projectJpaRepository.findByCreatedById(createdById, pageable);
    }

    @Override
    public Page<Project> searchProjectsByNameOrTechnologyHR(String keyword, Pageable pageable) {
        Page<Project> byName = projectJpaRepository.findByNameContainingIgnoreCase(keyword, pageable);
        Page<Project> byTech = projectJpaRepository.findByTechnologiesContainingIgnoreCase(keyword, pageable);
        return byName.hasContent() ? byName : byTech;
    }
    @Override
    public Page<Project> searchProjectsByNameOrTechnologyForPM(Long userId, String keyword, Pageable pageable) {
        Page<Project> byName = projectJpaRepository.findByCreatedByIdAndNameContainingIgnoreCase(userId, keyword, pageable);
        Page<Project> byTech = projectJpaRepository.findByCreatedByIdAndTechnologiesContainingIgnoreCase(userId, keyword, pageable);
        return byName.hasContent() ? byName : byTech;
    }

    @Override
    public Project updateProject(Long id, Project updatedProject) {
        return projectJpaRepository.findById(id)
            .map(project -> {
                project.setName(updatedProject.getName());
                project.setDescription(updatedProject.getDescription());
                project.setStatus(updatedProject.getStatus());
                project.setStartDate(updatedProject.getStartDate());
                project.setEndDate(updatedProject.getEndDate());
                project.setBudget(updatedProject.getBudget());
                project.setTechnologies(updatedProject.getTechnologies());
                project.setUpdatedAt(new Date());
                return projectJpaRepository.save(project);
            })
            .orElseThrow(() -> new RuntimeException("Project not found with ID: " + id));
    }

    @Override
    public Project updateProjectStatus(Long id, ProjectStatus newStatus) {
        return projectJpaRepository.findById(id)
            .map(project -> {
                project.setStatus(newStatus);
                project.setUpdatedAt(new Date());
                return projectJpaRepository.save(project);
            })
            .orElseThrow(() -> new RuntimeException("Project not found with ID: " + id));
    }

    @Override
    public void deleteProjectById(Long id) {
        projectJpaRepository.deleteById(id);
    }

    @Override
    public HashMap<String, Long> getProjectStatsHR() {
        HashMap<String, Long> stats = new HashMap<>();
        stats.put("total", projectJpaRepository.count());
        stats.put("active", projectJpaRepository.countByStatus(ProjectStatus.ACTIVE));
        stats.put("completed", projectJpaRepository.countByStatus(ProjectStatus.COMPLETED));
        stats.put("planning", projectJpaRepository.countByStatus(ProjectStatus.PLANNING));
        stats.put("onhold", projectJpaRepository.countByStatus(ProjectStatus.ONHOLD));
        return stats;
    }

    @Override
    public List<Project> findByProjectIds(List<Long> projectIds) {
        return projectJpaRepository.findByIdIn(projectIds);
    }

    @Override
    public HashMap<String, Long> getProjectStatsPM(Long userId) {
        HashMap<String, Long> stats = new HashMap<>();
        stats.put("total", projectJpaRepository.countByCreatedById(userId));
        stats.put("active", projectJpaRepository.countByCreatedByIdAndStatus(userId, ProjectStatus.ACTIVE));
        stats.put("completed", projectJpaRepository.countByCreatedByIdAndStatus(userId, ProjectStatus.COMPLETED));
        stats.put("planning", projectJpaRepository.countByCreatedByIdAndStatus(userId, ProjectStatus.PLANNING));
        stats.put("onhold", projectJpaRepository.countByCreatedByIdAndStatus(userId, ProjectStatus.ONHOLD));
        return stats;
    }
}
