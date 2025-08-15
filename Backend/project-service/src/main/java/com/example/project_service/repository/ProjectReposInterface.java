package com.example.project_service.repository;

import com.example.project_service.models.Project;
import com.example.project_service.models.ProjectStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.HashMap;
import java.util.List;
import java.util.Optional;

public interface ProjectReposInterface {

    // Create project
    Project createProject(Project project);

    // Get project by id
    Optional<Project> getProjectById(Long id);

    // Get all projects (paged) — for HR
    Page<Project> getAllProjects(Pageable pageable);

    // Get projects created by specific user (paged) — for PM
    Page<Project> getProjectsByCreator(Long createdById, Pageable pageable);

    // Search projects by name or technology (paged)
    Page<Project> searchProjectsByNameOrTechnologyHR(String keyword, Pageable pageable);
    
    // Search projects by name or technology for PM (paged)
    Page<Project> searchProjectsByNameOrTechnologyForPM(Long userId, String keyword, Pageable pageable);

    // Update whole project
    Project updateProject(Long id, Project updatedProject);

    // Update project status only
    Project updateProjectStatus(Long id, ProjectStatus newStatus);

    // Delete project
    void deleteProjectById(Long id);

    // Get stats (total, active, completed, planning, onhold)
    HashMap<String, Long> getProjectStatsHR();
    HashMap<String, Long> getProjectStatsPM(Long userId);

    List<Project> findByProjectIds(List<Long> projectIds);
}
