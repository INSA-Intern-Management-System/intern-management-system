package com.example.project_service.repository;

import com.example.project_service.models.Team;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface TeamReposInterface {

    // Create team
    Team createTeam(Team team);

    

    // Assign project to team (update project)
    Team updateAssignedProject(Long teamId, Long newProjectId);

    // Remove assigned project (set project to null)
    Team removeAssignedProject(Long teamId);
    
    // Get project team by project id
    List<Team> getProjectTeamByProjectID(Long projectId);;

    // Get teams by manager id (paged)
    Page<Team> getTeamsByManager(Long managerId, Pageable pageable);

    // Get all teams (paged)
    Page<Team> getAllTeams(Pageable pageable);

    // Get team by id
    Optional<Team> getTeamById(Long id);

    // Delete team by id
    void deleteTeamById(Long id);
}
