package com.example.project_service.dto;

import java.util.List;

public class TeamDetailsResponse {
    private ProjectResponse project;
    private TeamResponse teams;
    private List<TeamMemberResponse> teamMembers;

    // Getters & setters
    public ProjectResponse getProject() { return project; }
    public void setProject(ProjectResponse project) { this.project = project; }

    public TeamResponse getTeams() { return teams; }
    public void setTeams(TeamResponse teams) { this.teams = teams; }

    public List<TeamMemberResponse> getTeamMembers() { return teamMembers; }
    public void setTeamMembers(List<TeamMemberResponse> teamMembers) { this.teamMembers = teamMembers; }
}
