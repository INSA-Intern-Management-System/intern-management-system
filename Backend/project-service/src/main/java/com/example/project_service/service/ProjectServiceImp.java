package com.example.project_service.service;

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

    @Autowired
    private ProjectMapper projectMapper;

    @Autowired
    public ProjectServiceImp(ProjectReposInterface projectRepo,
                             TeamReposInterface teamRepo,
                             TeamMemberReposInterface teamMemberRepo,
                             MilestoneReposInterface milestoneRepo) {
        this.projectRepo = projectRepo;
        this.teamRepo = teamRepo;
        this.teamMemberRepo = teamMemberRepo;
        this.milestoneRepo = milestoneRepo;
    }

    // ---------------- Projects ----------------
    @Override
    public ProjectResponse createProject(long user_id, ProjectRequest request) {
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
    public ProjectResponse updateProjectStatus(Long projectId, ProjectStatus newStatus) {
        return mapToDto(projectRepo.updateProjectStatus(projectId, newStatus));
    }

    // ---------------- Milestones ----------------
    @Override
    public MilestoneResponse addMilestone(MilestoneRequest request) {
        Milestone milestone = new Milestone();
        milestone.setTitle(request.getTitle());
        milestone.setDescription(request.getDescription());
        milestone.setStatus(request.getStatus());
        milestone.setDueDate(request.getDueDate());
        milestone.setCreatedAt(new Date());
        milestone.setUpdatedAt(new Date());
        Project project = new Project(); project.setId(request.getProjectId());
        milestone.setProject(project);
        return projectMapper.mapToDto(milestoneRepo.addMilestone(milestone));
    }

    @Override
    public MilestoneResponse updateMilestoneStatus(Long milestoneId, MilestoneStatus newStatus) {
        return projectMapper.mapToDto(milestoneRepo.updateMilestoneStatus(milestoneId, newStatus));
    }

    @Override
    public void deleteMilestone(Long milestoneId) {
        milestoneRepo.removeMilestoneById(milestoneId);
    }

    @Override
    public List<MilestoneResponse> getMilestonesByProjectId(Long projectId) {
        List<Milestone> milestones = milestoneRepo.getMilestonesByProjectId(projectId);
        return milestones.stream()
                .map(projectMapper::mapToDto)
                .collect(Collectors.toList());
    }

    // ---------------- Teams ----------------
    @Transactional
    @Override
    public TeamDetailsResponse createTeam(TeamRequest request) {
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
    public void deleteTeam(Long teamId) {
        teamMemberRepo.deleteMembersByTeam(teamId);
        teamRepo.deleteTeamById(teamId);
    }

    // ---------------- Team members ----------------
    @Transactional
    @Override
    public List<TeamMemberResponse> addTeamMember(TeamMemberRequest request) {
        // Get all members of the target team
        List<TeamMember> existingMembers = teamMemberRepo.getMemberByTeamId(request.getTeamId());

        // Check if the same memberId already exists in that team
        boolean alreadyExists = existingMembers.stream()
            .anyMatch(m -> m.getMemberId()==request.getMemberId());

        if (!alreadyExists) {
            TeamMember member = new TeamMember();
            member.setRole(request.getRole());
            member.setJoinedAt(new Date());
            Team team = new Team();
            team.setId(request.getTeamId());
            member.setTeam(team);
            member.setMemberId(request.getMemberId());

            teamMemberRepo.addMember(member);
        }

        // Fetch updated list and map to DTOs
        List<TeamMember> updatedMembers = teamMemberRepo.getMemberByTeamId(request.getTeamId());
        return updatedMembers.stream()
            .map(projectMapper::mapToDto)
            .collect(Collectors.toList());
    }

    @Override
    public void removeTeamMember(Long memberId) {
        teamMemberRepo.deleteMemberById(memberId);
    }

    @Transactional
    @Override
    public void removeAllTeamMembers(Long teamId) {
        teamMemberRepo.deleteMembersByTeam(teamId);
    }

    // ---------------- Assign/remove project ----------------
    @Transactional
    @Override
    public TeamDetailsResponse assignProjectToTeam(Long teamId, Long projectId) {
        // Fetch the team
        Team team = teamRepo.getTeamById(teamId)
            .orElseThrow(() -> new RuntimeException("Team not found with id: " + teamId));

        // Replace or add new assigned project
        Project project =new Project();
        project.setId(projectId);
        team.setProject(project);
        Team updatedTeam = teamRepo.updateAssignedProject(teamId, projectId);

        // Fetch latest team members
        List<TeamMember> members = teamMemberRepo.getMemberByTeamId(teamId);

        // Fetch assigned project details (if needed; assuming you have getProjectById)
        Project assignedProject = projectRepo.getProjectById(projectId)
            .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));

        // Map to DTO
        TeamDetailsResponse dto = new TeamDetailsResponse();
        dto.setProject(projectMapper.mapToDto(assignedProject));
        dto.setTeams(projectMapper.mapToDto(updatedTeam));
        dto.setTeamMembers(members.stream()
            .map(projectMapper::mapToDto)
            .collect(Collectors.toList()));

        return dto;
    }

    @Transactional
    @Override
    public TeamDetailsResponse removeAssignedProjectFromTeam(Long teamId) {
        // Fetch team members
        List<TeamMember> members = teamMemberRepo.getMemberByTeamId(teamId);
        // Remove the assigned project from the team
       
        Team updatedTeam = teamRepo.removeAssignedProject(teamId);
        // Map to DTO
        TeamDetailsResponse dto = new TeamDetailsResponse();
        dto.setProject(null); // No project assigned now
        dto.setTeams(projectMapper.mapToDto(updatedTeam));
        dto.setTeamMembers(members.stream()
            .map(projectMapper::mapToDto)
            .collect(Collectors.toList()));
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

}
