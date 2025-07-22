package com.example.project_service.dto;

import com.example.project_service.models.Team;
import com.example.project_service.models.TeamMember;
import com.example.project_service.models.Project;

import java.util.List;

public class TeamDetailsDto {
    private Team team;
    private List<TeamMember> teamMembers;
    private Project assignedProject;

    // Getters and setters
    public Team getTeam() { return team; }
    public void setTeam(Team team) { this.team = team; }

    public List<TeamMember> getTeamMembers() { return teamMembers; }
    public void setTeamMembers(List<TeamMember> teamMembers) { this.teamMembers = teamMembers; }

    public Project getAssignedProject() { return assignedProject; }
    public void setAssignedProject(Project assignedProject) { this.assignedProject = assignedProject; }
}
