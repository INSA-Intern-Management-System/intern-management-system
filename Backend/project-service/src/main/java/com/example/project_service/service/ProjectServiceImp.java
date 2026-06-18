package com.example.project_service.service;

import com.example.project_service.client.ActivityGrpcClient;
import com.example.project_service.client.InternManagerGrpcClient;
import com.example.project_service.client.UserGrpcClient;
import com.example.project_service.dto.*;
import com.example.project_service.models.*;
import com.example.project_service.repository.*;
import com.example.userservice.gRPC.CreateResponse;
import com.example.userservice.gRPC.UserResponse;
import com.example.userservice.gRPC.UsersResponse;

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
    private final InternManagerGrpcClient internManagerGrpcClient;
    private final UserGrpcClient userGrpcClient;

    @Autowired
    private ProjectMapper projectMapper;

    @Autowired
    public ProjectServiceImp(ProjectReposInterface projectRepo,
                             TeamReposInterface teamRepo,
                             TeamMemberReposInterface teamMemberRepo,
                             MilestoneReposInterface milestoneRepo,
                             ActivityGrpcClient activityGrpcClient,
                             InternManagerGrpcClient internManagerGrpcClient,
                             UserGrpcClient userGrpcClient) {
        this.projectRepo = projectRepo;
        this.teamRepo = teamRepo;
        this.teamMemberRepo = teamMemberRepo;
        this.milestoneRepo = milestoneRepo;
        this.activityGrpcClient = activityGrpcClient;
        this.internManagerGrpcClient= internManagerGrpcClient;
        this.userGrpcClient=userGrpcClient;
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
    @Transactional
    public void deleteProject(String jwtToken,Long user_id,Long projectId){
        //get the project base on the project id
        Optional<Project> project = projectRepo.getProjectById(projectId);
        
        //check if the project exists
        if(project.isEmpty()){
            new RuntimeException("Project not found with id: " + projectId);
        }

        //check if the user is the manager of the project
        if(!project.get().getCreatedBy().getId().equals(user_id)){
            new RuntimeException("Unauthorized access for the project");
        }
        //delete project by id
        try{
            projectRepo.deleteProjectById(projectId);
        }catch( Exception e){
            new RuntimeException("cant delete project from projects");
        }
        // Log activity
        logActivity(jwtToken, user_id, "DELETE_PROJECT", "Project '" + project.get().getName() + "' deleted successfully.");
        
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
    public ProjectResponse updateProjectStatus(String jwtToken,Long user_id,Long projectId, ProjectStatus newStatus) {
        // Validate project exists
        Project project = projectRepo.getProjectById(projectId)
            .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));
        
        //check wether the user is a manager 
        if( project.getCreatedBy().getId()==user_id){
            throw new RuntimeException("Unauthorized: Only project manager can update project status");
        }

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

    @Override
    @Transactional
    public void updateStatus(String jwtToken,Long user_id,UpdateRequestDTO request){
        if(request.getProjectId()!=null){
            // Validate project exists
            Project project = projectRepo.getProjectById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + request.getProjectId()));

            //update project status
            if (project.getStatus() == request.getProjectStatus()) {
                throw new RuntimeException("Project already has the status: " + request.getProjectId());
            }
        
            Project new_project=projectRepo.updateProjectStatus(request.getProjectId(), request.getProjectStatus());
            logActivity(jwtToken, project.getCreatedBy().getId(), "Project status updated","Project Name: " + project.getName() +  "Project ID: " +request.getProjectId() + ", New Status: " + request.getProjectStatus());
        }
        if (request.getMilestoneIds()!=null){
            //get the list of milestone using lists of milestone ids;
            List<Milestone> milestones = milestoneRepo.findByIdIn(request.getMilestoneIds());
            if (milestones == null || milestones.isEmpty()) {
                throw new RuntimeException("Milestone not found with id: " + request.getMilestoneIds());
            }

            //check wether the miletones the user if the creator of the project
            for(Milestone milestone:milestones){
                Project project = milestone.getProject();
                if (!project.getCreatedBy().getId().equals(user_id)) {
                    throw new RuntimeException("Unauthorized: Only project creator can update milestone status");
                }
            }
            milestoneRepo.updateStatuses(request.getMilestoneIds(), request.getMilestoneStatuses());
            logActivity(jwtToken, user_id, "Milestone status updated","Milestone status is updated");
        }
        

    }

    @Transactional
    @Override
    public List<ProjectMilestoneStatsDTO> findMilestoneStatsByProjectsAndStatus(List<Long> projectIds, MilestoneStatus status) {
        return milestoneRepo.findMilestoneStatsByProjectsAndStatus(projectIds, status);
    }

    @Transactional
    @Override
    public UniveristyMilestoneStatsDTO getStats(List<Long> ids){
        UniveristyMilestoneStatsDTO result=new UniveristyMilestoneStatsDTO(null, null);
        result.setStatusCount(milestoneRepo.countByProjectIdsAndStatus(ids, MilestoneStatus.PENDING));
        result.setTotalMilestones(milestoneRepo.countByProjectIds(ids));
        return result;

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
    @Transactional(readOnly = true)
    @Override
    public List<Milestone> getMilestonesByProjectIdExceptCompleted(Long projectId) {
        //get milestones using project 
        List<Milestone> milestone=milestoneRepo.getMilestonesByProjectIdExceptCompleted(projectId);
        if (milestone == null || milestone.isEmpty()) {
            return Collections.emptyList();
        }
        return milestone;

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

        //collect all member ids 
        List<Long> memberIds = savedMembers.stream()
            .map(TeamMember::getMemberId)
            .toList();

        // get team members information using user grpc
        UsersResponse result = userGrpcClient.getAllUsers(jwtToken, memberIds);

        // create a lookup map for user responses
        Map<Long, UserResponse> userMap = result.getUsersList().stream()
                .collect(Collectors.toMap(UserResponse::getUserId, u -> u));

        // Set team members with enriched data
        List<TeamMemberResponse> memberResponses = savedMembers.stream()
                .map(member -> {
                    UserResponse userResponse = userMap.get(member.getMemberId());
                    return projectMapper.mapToDto(member, userResponse);
                })
                .filter(Objects::nonNull)
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
    public void deleteTeam(String jwtToken,Long user_id,Long teamId) {
        // Validate team exists
        Team team = teamRepo.getTeamById(teamId)
            .orElseThrow(() -> new RuntimeException("Team not found with id: " + teamId));

        //check wether the user is the manager of the team
        if(!team.getManager().getId().equals(user_id)){
            throw new RuntimeException("Unauthorized access for the team)");
        }

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

        //collect team members into list
        List<Long> memberIds = updatedMembers.stream()
            .map(TeamMember::getMemberId)
            .toList();

        UsersResponse result=userGrpcClient.getAllUsers(jwtToken, memberIds);

        // map by user ID for easy lookup
         Map<Long, UserResponse> userMap = result.getUsersList().stream()
            .collect(Collectors.toMap(UserResponse::getUserId, u -> u));

        // map TeamMember + UserResponse → DTO
        List<TeamMemberResponse> memberResponses = updatedMembers.stream()
            .map(member -> {
                UserResponse userResponse = userMap.get(member.getMemberId());
                return projectMapper.mapToDto(member, userResponse);
            })
            .filter(Objects::nonNull)
            .toList();

        // log activity
        logActivity(jwtToken, managerId, "ADD_TEAM_MEMBER",
                "Member with ID " + request.getMemberId() + " added to team '" + team.getName() + "' with role '" + request.getRole() + "'.");

        return memberResponses;
        
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
    public TeamDetailsResponse assignProjectToTeam(String jwtToken, Long user_id, Long teamId, Long projectId) {
        // Fetch the team
        Team team = teamRepo.getTeamById(teamId)
            .orElseThrow(() -> new RuntimeException("Team not found with id: " + teamId));

        // Fetch team members
        List<TeamMember> teamMembers = teamMemberRepo.getMemberByTeamId(teamId);

        // Collect member IDs
        List<Long> memberIds = teamMembers.stream()
            .map(TeamMember::getMemberId)
            .toList();

        // Fetch the project
        Project currentProject = projectRepo.getProjectById(projectId)
            .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));

        // Authorization checks
        if (!team.getManager().getId().equals(user_id)) {
            throw new RuntimeException("Unauthorized: Only team manager can assign projects");
        }

        if (!currentProject.getCreatedBy().getId().equals(user_id)) {
            throw new RuntimeException("Unauthorized: Only project creator can assign the project to a team");
        }

        // Assign project
        team.setProject(currentProject);
        Team updatedTeam = teamRepo.updateAssignedProject(teamId, projectId);

        Project assignedProject = projectRepo.getProjectById(projectId)
            .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));

        // ✅ Fetch user info from gRPC
        UsersResponse result = userGrpcClient.getAllUsers(jwtToken, memberIds);

        // Build map for quick lookup
        Map<Long, UserResponse> userMap = result.getUsersList().stream()
            .collect(Collectors.toMap(UserResponse::getUserId, u -> u));

        // ✅ Map members + user info
        List<TeamMemberResponse> memberResponses = teamMembers.stream()
            .map(member -> {
                UserResponse userResponse = userMap.get(member.getMemberId());
                return projectMapper.mapToDto(member, userResponse);
            })
            .filter(Objects::nonNull)
            .toList();

        // Build DTO
        TeamDetailsResponse dto = new TeamDetailsResponse();
        dto.setProject(projectMapper.mapToDto(assignedProject));
        dto.setTeams(projectMapper.mapToDto(updatedTeam));
        dto.setTeamMembers(memberResponses);

        // send through intern manager gRPC 
        CreateResponse response = internManagerGrpcClient.createInternManagers(
                jwtToken, memberIds, projectId, team.getManagerId(), teamId);

        if (!response.getMessage()) {
            throw new RuntimeException("Failed to assign project to team");
        }

        // Log activity
        logActivity(jwtToken, user_id, "ASSIGN_PROJECT_TO_TEAM",
                "Project '" + assignedProject.getName() + "' assigned to team '" + updatedTeam.getName() + "'.");

        return dto;
}


    @Transactional
    @Override
    public TeamDetailsResponse removeAssignedProjectFromTeam(String jwtToken, Long user_id, Long teamId) {
        // Fetch the team
        Team team = teamRepo.getTeamById(teamId)
            .orElseThrow(() -> new RuntimeException("Team not found with id: " + teamId));

        // Authorization: Only manager can remove assigned project
        if (!team.getManager().getId().equals(user_id)) {
            throw new RuntimeException("Unauthorized: Only team manager can remove assigned project");
        }

        // Get team members
        List<TeamMember> members = teamMemberRepo.getMemberByTeamId(teamId);

        // Collect member IDs
        List<Long> memberIds = members.stream()
            .map(TeamMember::getMemberId)
            .toList();

        // ✅ Fetch user info from gRPC
        UsersResponse result = userGrpcClient.getAllUsers(jwtToken, memberIds);

        // Build map for quick lookup
        Map<Long, UserResponse> userMap = result.getUsersList().stream()
            .collect(Collectors.toMap(UserResponse::getUserId, u -> u));

        // ✅ Map members + user info
        List<TeamMemberResponse> memberResponses = members.stream()
            .map(member -> {
                UserResponse userResponse = userMap.get(member.getMemberId());
                return projectMapper.mapToDto(member, userResponse);
            })
            .filter(Objects::nonNull)
            .toList();

        // Remove the assigned project
        Team updatedTeam = teamRepo.removeAssignedProject(teamId);

        // Build DTO
        TeamDetailsResponse dto = new TeamDetailsResponse();
        dto.setProject(null); // No project assigned now
        dto.setTeams(projectMapper.mapToDto(updatedTeam));
        dto.setTeamMembers(memberResponses);

        // Log activity
        logActivity(jwtToken, user_id, "REMOVE_ASSIGNED_PROJECT",
                "Assigned project removed from team '" + updatedTeam.getName() + "'.");

        return dto;
}




    // ---------------- New detailed use cases ----------------
    @Transactional(readOnly = true)
    @Override
    public Page<ProjectDetailsResponse> getDetailedProjectsForHr(String jwtToken,Pageable pageable) {
        Page<Project> projects = projectRepo.getAllProjects(pageable);
        List<ProjectDetailsResponse> detailedList = buildProjectDetailsList(jwtToken,projects.getContent());
        return new PageImpl<>(detailedList, pageable, projects.getTotalElements());
    }

    @Transactional(readOnly = true)
    @Override
    public Page<ProjectDetailsResponse> getDetailedProjectsForPm(String jwtToken,Long createdById, Pageable pageable) {
        Page<Project> projects = projectRepo.getProjectsByCreator(createdById, pageable);
        List<ProjectDetailsResponse> detailedList = buildProjectDetailsList(jwtToken,projects.getContent());
        return new PageImpl<>(detailedList, pageable, projects.getTotalElements());
    }

    private List<ProjectDetailsResponse> buildProjectDetailsList(String jwtToken, List<Project> projects) {
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

            // Collect all team members for this project
            List<TeamMember> allMembers = new ArrayList<>();
            for (Team team : teams) {
                List<TeamMember> members = teamMemberRepo.getMemberByTeamId(team.getId());
                allMembers.addAll(members);
            }

            // Collect member IDs
            List<Long> memberIds = allMembers.stream()
                .map(TeamMember::getMemberId)
                .toList();

            // ✅ Fetch user info via gRPC once for all members
            UsersResponse grpcUsers = userGrpcClient.getAllUsers(jwtToken, memberIds);

            // Build lookup map
            Map<Long, UserResponse> userMap = grpcUsers.getUsersList().stream()
                .collect(Collectors.toMap(UserResponse::getUserId, u -> u));

            // ✅ Map members + enrich with user info
            List<TeamMemberResponse> memberDtos = allMembers.stream()
                .map(member -> {
                    UserResponse userResponse = userMap.get(member.getMemberId());
                    return projectMapper.mapToDto(member, userResponse);
                })
                .filter(Objects::nonNull)
                .toList();
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
    public Page<TeamDetailsResponse> getDetailedTeamsForHr(String jwtToken,Pageable pageable) {
        Page<Team> teams = teamRepo.getAllTeams(pageable);
        List<TeamDetailsResponse> detailedList = buildTeamDetailsList(jwtToken,teams.getContent());
        return new PageImpl<>(detailedList, pageable, teams.getTotalElements());
    }

    @Transactional(readOnly = true)
    @Override
    public Page<TeamDetailsResponse> getDetailedTeamsForPm(String jwtToken,Long managerId, Pageable pageable) {
            Page<Team> teams = teamRepo.getTeamsByManager(managerId, pageable);
            List<TeamDetailsResponse> detailedList = buildTeamDetailsList(jwtToken,teams.getContent());
            return new PageImpl<>(detailedList, pageable, teams.getTotalElements());
        }


    private List<TeamDetailsResponse> buildTeamDetailsList(String jwtToken, List<Team> teams) {
        List<TeamDetailsResponse> result = new ArrayList<>();

        for (Team team : teams) {
            TeamDetailsResponse dto = new TeamDetailsResponse();

            // Map project
            dto.setProject(projectMapper.mapToDto(team.getProject()));

            // Map the team itself
            dto.setTeams(projectMapper.mapToDto(team));

            // Fetch and map members
            List<TeamMember> members = teamMemberRepo.getMembersByTeam(team.getId());

            // Collect member IDs
            List<Long> memberIds = members.stream()
                .map(TeamMember::getMemberId)
                .toList();

            // ✅ Fetch user info from gRPC
            UsersResponse grpcUsers = userGrpcClient.getAllUsers(jwtToken, memberIds);

            // Build lookup map
            Map<Long, UserResponse> userMap = grpcUsers.getUsersList().stream()
                .collect(Collectors.toMap(UserResponse::getUserId, u -> u));

            // ✅ Map members + user info
            List<TeamMemberResponse> memberDtos = members.stream()
                .map(member -> {
                    UserResponse userResponse = userMap.get(member.getMemberId());
                    return projectMapper.mapToDto(member, userResponse);
                })
                .filter(Objects::nonNull)
                .toList();

            dto.setTeamMembers(memberDtos);

            result.add(dto);
        }

        return result;
}
    @Override
    @Transactional(readOnly = true)
    public List<ProjectProgressDTO> getProjectProgress(List<Long> project_ids){
        //get needed data from the data
        List<Project> projects=projectRepo.findByProjectIds(project_ids);
        if (projects==null){
            new RuntimeException("Project not found");
        }
        List<ProjectMilestoneStatsDTO> stats=milestoneRepo.findMilestoneStatsByProjectsAndStatus(project_ids, MilestoneStatus.PENDING);
        if (stats==null){
            new RuntimeException("Milestone not found");
        } 
        //compute rating and use map for lookup
        Map<Long,Long> mapping= new HashMap<>();
        for(ProjectMilestoneStatsDTO stat: stats){
            if (stat.getTotalMilestones()==0){
                continue;
            }
            Long rating=stat.getStatusCount()/stat.getTotalMilestones();
            mapping.put(stat.getProjectId(), rating);
        }

        List<ProjectProgressDTO> response=new ArrayList<>();
        for(Project project:projects){
            if(mapping.get(project.getId())==null){
                continue;
            }
            ProjectProgressDTO dto=new ProjectProgressDTO();
            dto.setProjectID(project.getId());
            dto.setProjectName(project.getName());
            dto.setProjectDescription(project.getDescription());
            dto.setProgress(mapping.get(project.getId()));
        }
        return response;

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
