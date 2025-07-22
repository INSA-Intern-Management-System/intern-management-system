package com.example.project_service.repository;

import com.example.project_service.models.Project;
import com.example.project_service.models.Team;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class TeamReposImp implements TeamReposInterface {

    private final TeamJpaRepository teamJpaRepository;
    private final ProjectJpaRepository projectJpaRepository;

    @Autowired
    public TeamReposImp(TeamJpaRepository teamJpaRepository, ProjectJpaRepository projectJpaRepository) {
        this.teamJpaRepository = teamJpaRepository;
        this.projectJpaRepository = projectJpaRepository;
    }

    @Override
    public Team createTeam(Team team) {
        return teamJpaRepository.save(team);
    }

    @Override
    public Team updateAssignedProject(Long teamId, Long newProjectId) {
        return teamJpaRepository.findById(teamId).map(team -> {
            Project project = projectJpaRepository.findById(newProjectId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            team.setProject(project);
            team.setUpdatedAt(new java.util.Date());
            return teamJpaRepository.save(team);
        }).orElseThrow(() -> new RuntimeException("Team not found"));
    }

    @Override
    public Team removeAssignedProject(Long teamId) {
        return teamJpaRepository.findById(teamId).map(team -> {
            team.setProject(null);
            team.setUpdatedAt(new java.util.Date());
            return teamJpaRepository.save(team);
        }).orElseThrow(() -> new RuntimeException("Team not found"));
    }

    @Override
    public Page<Team> getTeamsByManager(Long managerId, Pageable pageable) {
        return teamJpaRepository.findByManager_Id(managerId, pageable);
    }

    @Override
    public Page<Team> getAllTeams(Pageable pageable) {
        return teamJpaRepository.findAll(pageable);
    }

    @Override
    public Optional<Team> getTeamById(Long id) {
        return teamJpaRepository.findById(id);
    }

    @Override
    public void deleteTeamById(Long id) {
        teamJpaRepository.deleteById(id);
    }

    @Override
    public List<Team> getProjectTeamByProjectID(Long projectId) {
        return teamJpaRepository.findByProjectId(projectId);
    }
}
