package com.example.project_service.service;

import com.example.project_service.client.ActivityGrpcClient;
import com.example.project_service.dto.*;
import com.example.project_service.models.*;
import com.example.project_service.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProjectServiceImp implements ProjectServiceInterface {

    private final ProjectReposInterface projectRepo;
    private final TeamReposInterface teamRepo;
    private final TeamMemberReposInterface teamMemberRepo;
    private final MilestoneReposInterface milestoneRepo;
    private final ActivityGrpcClient activityGrpcClient;

    @Autowired
    private ProjectMapper projectMapper;

    @Autowired
    public ProjectServiceImp(ProjectReposInterface projectRepo,
                             TeamReposInterface teamRepo,
                             TeamMemberReposInterface teamMemberRepo,
                             MilestoneReposInterface milestoneRepo,
                             ActivityGrpcClient activityGrpcClient) {
        this.projectRepo = projectRepo;
        this.teamRepo = teamRepo;
        this.teamMemberRepo = teamMemberRepo;
        this.milestoneRepo = milestoneRepo;
        this.activityGrpcClient = activityGrpcClient;
    }

    // ---------------- Projects ----------------
    @Override
    public ProjectResponse createProject(String jwtToken,long user_id, ProjectRequest request) {
        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setStatus(request.getStatus());
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());
        project.setBudget(request.getBudget());
        project.setTechnologies(request.getTechnologies());
        User user = new User(); user.setId(user_id);
        project.setCreatedBy(user);
        project.setCreatedAt(new Date());
        project.setUpdatedAt(new Date());
        ProjectResponse new_project = new ProjectResponse();
        new_project = mapToDto(projectRepo.createProject(project));
        // Log activity
        activityGrpcClient.createActivity(jwtToken, user_id, "Project created", "Project " + request.getName() + " created successfully.");
        return new_project;
    }

    @Override
    public HashMap<String, Long> getProjectStatsHR() {
        return projectRepo.getProjectStatsHR();
    }
    @Override
    public HashMap<String, Long> getProjectStatsPM(Long userId) {
        return projectRepo.getProjectStatsPM(userId);
    }

    @Override
    public Page<ProjectResponse> searchProjectsHR(String keyword, Pageable pageable) {
        Page<Project> projects = projectRepo.searchProjectsByNameOrTechnologyHR(keyword, pageable);
        return projects.map(this::mapToDto);
    }
    @Override
    public Page<ProjectResponse> searchProjectsPM(Long userId, String keyword, Pageable pageable) {
        Page<Project> projects = projectRepo.searchProjectsByNameOrTechnologyForPM(userId, keyword, pageable);
        return projects.map(this::mapToDto);
    }


    @Override
    public Page<ProjectResponse> getProjectsForHr(Pageable pageable) {
        Page<Project> projects=projectRepo.getAllProjects(pageable);
        return projects.map(this::mapToDto);
    }

    @Override
    public Page<ProjectResponse>  getProjectsForPm(Long createdById, Pageable pageable) {
        Page<Project> projects=projectRepo.getProjectsByCreator(createdById, pageable);
        return projects.map(this::mapToDto);
    }

    @Override
    public ProjectResponse updateProjectStatus(String jwtToken,Long projectId, ProjectStatus newStatus) {
        // Validate project exists
        Project project = projectRepo.getProjectById(projectId)
            .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));

        //update project status
        if (project.getStatus() == newStatus) {
            throw new RuntimeException("Project already has the status: " + newStatus);
        }
      
        Project new_project=projectRepo.updateProjectStatus(projectId, newStatus);
        logActivity(jwtToken, project.getCreatedBy().getId(), "Project status updated","Project Name: " + project.getName() +  "Project ID: " + projectId + ", New Status: " + newStatus);
        return mapToDto(new_project);
    }

    // ---------------- Milestones ----------------
    @Transactional
    @Override
    public MilestoneResponse addMilestone(String jwtToken, Long user_id, MilestoneRequest request) {
        // Validate project exists & check if user is the project creator
        Project current_project = projectRepo.getProjectById(request.getProjectId())
            .orElseThrow(() -> new RuntimeException("Project not found with id: " + request.getProjectId()));

        if (!current_project.getCreatedBy().getId().equals(user_id)) {
            throw new RuntimeException("Unauthorized: Only project creator can add milestones");
        }

        // Create and save the milestone
        Milestone milestone = new Milestone();
        milestone.setTitle(request.getTitle());
        milestone.setDescription(request.getDescription());
        milestone.setStatus(request.getStatus());
        milestone.setDueDate(request.getDueDate());
        milestone.setCreatedAt(new Date());
        milestone.setUpdatedAt(new Date());
        Project project = new Project(); 
        project.setId(request.getProjectId());
        milestone.setProject(project);

        Milestone savedMilestone = milestoneRepo.addMilestone(milestone);

        // Log activity AFTER successful save
        logActivity(jwtToken, user_id, "ADD_MILESTONE", "Milestone '" + savedMilestone.getTitle() + "' added to project '" + current_project.getName() + "'.");

        return projectMapper.mapToDto(savedMilestone);
    }


    @Transactional
    @Override
    public MilestoneResponse updateMilestoneStatus(String jwtToken,Long user_id,Long milestoneId, MilestoneStatus newStatus) {
        // Validate milestone exists & check if user is the project creator
        Milestone milestone = milestoneRepo.getMilestoneById(milestoneId)
            .orElseThrow(() -> new RuntimeException("Milestone not found with id: " + milestoneId));
        Project project = milestone.getProject();
        if (!project.getCreatedBy().getId().equals(user_id)) {
            throw new RuntimeException("Unauthorized: Only project creator can update milestone status");
        }

        Milestone new_milestone=milestoneRepo.updateMilestoneStatus(milestoneId, newStatus);
        // Log activity
        logActivity(jwtToken, user_id, "UPDATE_MILESTONE_STATUS", "Milestone '" + new_milestone.getTitle() + "' status updated to " + newStatus + " in project '" + project.getName() + "'.");
        return projectMapper.mapToDto(new_milestone);
    }

    @Transactional
    @Override
    public void deleteMilestone(String jwtToken,Long user_id,Long milestoneId) {
        // Validate milestone exists & check if user is the project creator
        Milestone milestone = milestoneRepo.getMilestoneById(milestoneId)
            .orElseThrow(() -> new RuntimeException("Milestone not found with id: " + milestoneId));
        Project project = milestone.getProject();
        if (!project.getCreatedBy().getId().equals(user_id)) {
            throw new RuntimeException("Unauthorized: Only project creator can delete milestones");
        }
        milestoneRepo.removeMilestoneById(milestoneId);
        // Log activity
        logActivity(jwtToken, user_id, "DELETE_MILESTONE", "Milestone '" + milestone.getTitle() + "' deleted from project '" + project.getName() + "'.");
    }

    @Transactional(readOnly = true)
    @Override
    public List<MilestoneResponse> getMilestonesByProjectId(Long userID,Long projectId) {
        List<Milestone> milestones = milestoneRepo.getMilestonesByProjectId(projectId);
        if (milestones == null || milestones.isEmpty()) {
            return Collections.emptyList();
        }
        // Check if user is the project creator
        Project project = projectRepo.getProjectById(projectId)
            .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));
        if (!project.getCreatedBy().getId().equals(userID)) {
            throw new RuntimeException("Unauthorized: Only project creator can view milestones");
        }
        // Map milestones to DTOs
        return milestones.stream()
                .map(projectMapper::mapToDto)
                .collect(Collectors.toList());
    }

    // ---------------- Teams ----------------
    @Transactional
    @Override
    public TeamDetailsResponse createTeam(String jwtToken,TeamRequest request) {
        //Create and save the team
        Team team = new Team();
        team.setName(request.getName());
        team.setManagerId(request.getManagerId());
        team.setCreatedAt(new Date());
        team.setUpdatedAt(new Date());

        if (request.getProjectId() != null) {
            Project project = new Project();
            project=projectRepo.getProjectById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + request.getProjectId()));
           
            team.setProject(project);
        }

        Team savedTeam = teamRepo.createTeam(team);

        //If memberIds (with roles) are provided, build list of TeamMember
        List<TeamMember> savedMembers = new ArrayList<>();
        if (request.getMembers() != null && !request.getMembers().isEmpty()) {

            List<TeamMember> teamMembers = new ArrayList<>();
            for (Map.Entry<String, String> entry : request.getMembers().entrySet()) {
                String memberIdStr = entry.getKey();
                String role = entry.getValue();

                try {
                    Long memberId = Long.parseLong(memberIdStr);

                    TeamMember teamMember = new TeamMember();
                    teamMember.setTeam(savedTeam);

                    User member = new User();
                    member.setId(memberId);
                    teamMember.setMember(member);

                    teamMember.setRole(role);
                    teamMember.setJoinedAt(new Date());

                    teamMembers.add(teamMember);

                } catch (NumberFormatException e) {
                    // Log the issue or handle it as needed
                    System.err.println("Invalid member ID: " + memberIdStr + ". Skipping this member.");
                }
            }
            savedMembers = teamMemberRepo.addAllMembers(teamMembers);

        }

        //Build and return TeamDetailsResponse
        TeamDetailsResponse response = new TeamDetailsResponse();
        response.setTeams(projectMapper.mapToDto(savedTeam));

        // Set assigned project info
        if (savedTeam.getProject() != null) {
            response.setProject(projectMapper.mapToDto(savedTeam.getProject()));
        }

        // Set team members
        List<TeamMemberResponse> memberResponses = savedMembers.stream()
                .map(projectMapper::mapToDto)
                .toList();
        response.setTeamMembers(memberResponses);
        // Log activity
        logActivity(jwtToken, savedTeam.getManagerId(), "CREATE_TEAM", "Team '" + savedTeam.getName() + "' created successfully with " + savedMembers.size() + " members.");
        return response;
    }



    @Override
    public Page<Team> getTeamsForHr(Pageable pageable) {
        return teamRepo.getAllTeams(pageable);
    }

    @Override
    public Page<Team> getTeamsForPm(Long managerId, Pageable pageable) {
        return teamRepo.getTeamsByManager(managerId, pageable);
    }

    @Transactional
    @Override
    public void deleteTeam(String jwtToken,Long teamId) {
        // Validate team exists
        Team team = teamRepo.getTeamById(teamId)
            .orElseThrow(() -> new RuntimeException("Team not found with id: " + teamId));
        teamMemberRepo.deleteMembersByTeam(teamId);
        teamRepo.deleteTeamById(teamId);

        // Log activity
        logActivity(jwtToken, team.getManagerId(), "DELETE_TEAM", "Team '" + team.getName() + "' deleted successfully.");
    }

    // ---------------- Team members ----------------
    @Transactional
    @Override
    public List<TeamMemberResponse> addTeamMember(String jwtToken,Long managerId,TeamMemberRequest request) {
        // get the team by ID
        Team team = teamRepo.getTeamById(request.getTeamId())
            .orElseThrow(() -> new RuntimeException("Team not found with id: " + request.getTeamId()));

        //check if manager is the team manager
        if (!team.getManager().getId().equals(managerId)) {
            throw new RuntimeException("Unauthorized: Only team manager can add members");
        }
        
        // Check if the member already exists in the team
        List<TeamMember> existingMembers = teamMemberRepo.getMemberByTeamId(request.getTeamId());
        //check if member id is equal with 
        boolean alreadyExists=false;
        for (TeamMember member : existingMembers) {
            if (member.getMemberId()==request.getMemberId()) {
                alreadyExists = true;
                break;
            }
        }   

        if (!alreadyExists) {
            TeamMember member = new TeamMember();
            member.setRole(request.getRole());
            member.setJoinedAt(new Date());
            Team new_team = new Team();
            new_team.setId(request.getTeamId());
            member.setTeam(team);
            member.setMemberId(request.getMemberId());

            teamMemberRepo.addMember(member);
        }

        // Fetch updated list and map to DTOs
        List<TeamMember> updatedMembers = teamMemberRepo.getMemberByTeamId(request.getTeamId());
        logActivity(jwtToken, managerId, "ADD_TEAM_MEMBER", "Member with ID " + request.getMemberId() + " added to team '" + team.getName() + "' with role '" + request.getRole() + "'.");
        return updatedMembers.stream()
            .map(projectMapper::mapToDto)
            .collect(Collectors.toList());
        
    }

    @Override
    @Transactional
    public void removeTeamMember(String jwtToken,Long userID,Long memberId) {
        TeamMember teamMember = teamMemberRepo.getMemberById(memberId)
            .orElseThrow(() -> new RuntimeException("Team member not found with id: " + memberId));
        
        Team team = teamRepo.getTeamById(teamMember.getTeam().getId())
            .orElseThrow(() -> new RuntimeException("Team not found with id: " + teamMember.getTeam().getId()));
    
        if (!team.getManager().getId().equals(userID)) {
            throw new RuntimeException("Unauthorized: Only team manager can remove members");
        }
        teamMemberRepo.deleteMemberById(memberId);
        logActivity(jwtToken, userID, "REMOVE_TEAM_MEMBER", "Member with ID " + memberId + " removed from team '" + team.getName() + "'.");
    }

    @Transactional
    @Override
    public void removeAllTeamMembers(Long teamId) {
        teamMemberRepo.deleteMembersByTeam(teamId);
    }



    // ---------------- Assign/remove project ----------------
    @Transactional
    @Override
    public TeamDetailsResponse assignProjectToTeam(String jwtToken,Long user_id,Long teamId, Long projectId) {
        // Fetch the team
        Team team = teamRepo.getTeamById(teamId)
            .orElseThrow(() -> new RuntimeException("Team not found with id: " + teamId));

        // fetch the project
        Project current_project = projectRepo.getProjectById(projectId)
            .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));

        // Check if the user is the team manager
        if (!team.getManager().getId().equals(user_id)) {
            throw new RuntimeException("Unauthorized: Only team manager can assign projects");
        }

        // Check if the project is managed by the user
        if (!current_project.getCreatedBy().getId().equals(user_id)) {
            throw new RuntimeException("Unauthorized: Only project creator can assign the project to a team");
        }
       
        Project project =new Project();
        project.setId(projectId);
        team.setProject(project);
        Team updatedTeam = teamRepo.updateAssignedProject(teamId, projectId);
        List<TeamMember> members = teamMemberRepo.getMemberByTeamId(teamId);
        Project assignedProject = projectRepo.getProjectById(projectId)
            .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));

        // Map to DTO
        TeamDetailsResponse dto = new TeamDetailsResponse();
        dto.setProject(projectMapper.mapToDto(assignedProject));
        dto.setTeams(projectMapper.mapToDto(updatedTeam));
        dto.setTeamMembers(members.stream()
            .map(projectMapper::mapToDto)
            .collect(Collectors.toList()));

        // Log activity
        logActivity(jwtToken, user_id, "ASSIGN_PROJECT_TO_TEAM", "Project '" + assignedProject.getName() + "' assigned to team '" + updatedTeam.getName() + "'.");

        return dto;
    }

    @Transactional
    @Override
    public TeamDetailsResponse removeAssignedProjectFromTeam(String jwtToken,Long user_id,Long teamId) {
        // Fetch the team && Check if the user is the team manager
        Team team = teamRepo.getTeamById(teamId)
            .orElseThrow(() -> new RuntimeException("Team not found with id: " + teamId));
        if (!team.getManager().getId().equals(user_id)) {
            throw new RuntimeException("Unauthorized: Only team manager can remove assigned project");
        }
        List<TeamMember> members = teamMemberRepo.getMemberByTeamId(teamId);
        
        // Remove the assigned project from the team
        Team updatedTeam = teamRepo.removeAssignedProject(teamId);
        TeamDetailsResponse dto = new TeamDetailsResponse();
        dto.setProject(null); // No project assigned now
        dto.setTeams(projectMapper.mapToDto(updatedTeam));
        dto.setTeamMembers(members.stream()
            .map(projectMapper::mapToDto)
            .collect(Collectors.toList()));
        // Log activity
        logActivity(jwtToken, user_id, "REMOVE_ASSIGNED_PROJECT", "Assigned project removed from team '" + updatedTeam.getName() + "'.");
        return dto;
    
    }



    // ---------------- New detailed use cases ----------------
    @Transactional(readOnly = true)
    @Override
    public Page<ProjectDetailsResponse> getDetailedProjectsForHr(Pageable pageable) {
        Page<Project> projects = projectRepo.getAllProjects(pageable);
        List<ProjectDetailsResponse> detailedList = buildProjectDetailsList(projects.getContent());
        return new PageImpl<>(detailedList, pageable, projects.getTotalElements());
    }

    @Transactional(readOnly = true)
    @Override
    public Page<ProjectDetailsResponse> getDetailedProjectsForPm(Long createdById, Pageable pageable) {
        Page<Project> projects = projectRepo.getProjectsByCreator(createdById, pageable);
        List<ProjectDetailsResponse> detailedList = buildProjectDetailsList(projects.getContent());
        return new PageImpl<>(detailedList, pageable, projects.getTotalElements());
    }

    private List<ProjectDetailsResponse> buildProjectDetailsList(List<Project> projects) {
        List<ProjectDetailsResponse> result = new ArrayList<>();
        for (Project project : projects) {
            ProjectDetailsResponse dto = new ProjectDetailsResponse();

            dto.setProject(projectMapper.mapToDto(project));

            // Fetch and map teams
            List<Team> teams = teamRepo.getProjectTeamByProjectID(project.getId());
            List<TeamResponse> teamDtos = teams.stream()
                .map(projectMapper::mapToDto)
                .toList();
            dto.setTeams(teamDtos);

            // Fetch and map team members
            List<TeamMemberResponse> memberDtos = new ArrayList<>();
            for (Team team : teams) {
                List<TeamMember> members = teamMemberRepo.getMemberByTeamId(team.getId());
                members.forEach(member -> memberDtos.add(projectMapper.mapToDto(member)));
            }
            dto.setTeamMembers(memberDtos);

            // Fetch and map milestones
            List<Milestone> milestones = milestoneRepo.getMilestonesByProjectId(project.getId());
            List<MilestoneResponse> milestoneDtos = milestones.stream()
                .map(projectMapper::mapToDto)
                .toList();
            dto.setMilestones(milestoneDtos);

            result.add(dto);
        }
        return result;
}



    @Transactional(readOnly = true)
    @Override
    public Page<TeamDetailsResponse> getDetailedTeamsForHr(Pageable pageable) {
        Page<Team> teams = teamRepo.getAllTeams(pageable);
        List<TeamDetailsResponse> detailedList = buildTeamDetailsList(teams.getContent());
        return new PageImpl<>(detailedList, pageable, teams.getTotalElements());
    }

    @Transactional(readOnly = true)
    @Override
    public Page<TeamDetailsResponse> getDetailedTeamsForPm(Long managerId, Pageable pageable) {
            Page<Team> teams = teamRepo.getTeamsByManager(managerId, pageable);
            List<TeamDetailsResponse> detailedList = buildTeamDetailsList(teams.getContent());
            return new PageImpl<>(detailedList, pageable, teams.getTotalElements());
        }


    private List<TeamDetailsResponse> buildTeamDetailsList(List<Team> teams) {
        List<TeamDetailsResponse> result = new ArrayList<>();

        for (Team team : teams) {
            TeamDetailsResponse dto = new TeamDetailsResponse();

            // Map project
            dto.setProject(projectMapper.mapToDto(team.getProject()));

            // Map the team itself into a list (single element)
            dto.setTeams(projectMapper.mapToDto(team));

            // Fetch and map members
            List<TeamMember> members = teamMemberRepo.getMembersByTeam(team.getId());
            List<TeamMemberResponse> memberDtos = members.stream()
                .map(projectMapper::mapToDto)
                .toList();

            dto.setTeamMembers(memberDtos);

            result.add(dto);
        }
        return result;
}


    public ProjectResponse mapToDto(Project project) {
        ProjectResponse dto = new ProjectResponse();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setStatus(project.getStatus());
        dto.setStartDate(project.getStartDate());
        dto.setEndDate(project.getEndDate());
        dto.setBudget(project.getBudget());
        dto.setTechnologies(project.getTechnologies());
        dto.setCreatedBy(project.getCreatedBy().getId());
        dto.setCreatedAt(project.getCreatedAt());
        dto.setUpdatedAt(project.getUpdatedAt());
        return dto;
    }
    private void logActivity(String jwtToken, Long userId, String action, String description) {
        try {
            activityGrpcClient.createActivity(jwtToken, userId, action, description);
        } catch (Exception e) {
            // Log the failure, but do NOT block business logic
            System.err.println("Failed to log activity: " + e.getMessage());
        }
    }

}
