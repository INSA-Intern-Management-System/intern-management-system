package com.example.project_service.service;

import com.example.project_service.dto.*;
import com.example.project_service.models.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.HashMap;
import java.util.List;

public interface ProjectServiceInterface {
    // Projects
    ProjectResponse createProject(long user_id, ProjectRequest request);
    HashMap<String, Long> getProjectStatsHR();
    HashMap<String, Long> getProjectStatsPM(Long userId);
    Page<ProjectResponse> searchProjectsHR(String keyword, Pageable pageable);
    Page<ProjectResponse> searchProjectsPM(Long userId, String keyword, Pageable pageable);
    Page<ProjectResponse> getProjectsForHr(Pageable pageable);
    Page<ProjectResponse> getProjectsForPm(Long createdById, Pageable pageable);
    ProjectResponse updateProjectStatus(Long projectId, ProjectStatus newStatus);

    // Milestones
    MilestoneResponse addMilestone(MilestoneRequest request);
    MilestoneResponse updateMilestoneStatus(Long milestoneId, MilestoneStatus newStatus);
    void deleteMilestone(Long milestoneId);
    List<MilestoneResponse> getMilestonesByProjectId(Long projectId);

    // Teams
    TeamDetailsResponse createTeam(TeamRequest request);
    Page<Team> getTeamsForHr(Pageable pageable);
    Page<Team> getTeamsForPm(Long managerId, Pageable pageable);
    void deleteTeam(Long teamId);

    // Team members
    List<TeamMemberResponse> addTeamMember(TeamMemberRequest request);
    void removeTeamMember(Long memberId);
    void removeAllTeamMembers(Long teamId);

    // Assign/remove project
    TeamDetailsResponse assignProjectToTeam(Long teamId, Long projectId);
    TeamDetailsResponse removeAssignedProjectFromTeam(Long teamId);

    // Getters
    Page<ProjectDetailsResponse> getDetailedProjectsForHr(Pageable pageable);
    Page<ProjectDetailsResponse> getDetailedProjectsForPm(Long createdById, Pageable pageable);

    Page<TeamDetailsResponse> getDetailedTeamsForHr(Pageable pageable);
    Page<TeamDetailsResponse> getDetailedTeamsForPm(Long managerId, Pageable pageable);
}
