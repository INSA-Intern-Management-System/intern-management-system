package com.example.project_service.dto;

import java.util.List;

public class ProjectDetailsResponse {
    private ProjectResponse project;
    private List<TeamResponse> teams;
    private List<TeamMemberResponse> teamMembers;
    private List<MilestoneResponse> milestones;

    // Getters & setters
    public ProjectResponse getProject() { return project; }
    public void setProject(ProjectResponse project) { this.project = project; }

    public List<TeamResponse> getTeams() { return teams; }
    public void setTeams(List<TeamResponse> teams) { this.teams = teams; }

    public List<TeamMemberResponse> getTeamMembers() { return teamMembers; }
    public void setTeamMembers(List<TeamMemberResponse> teamMembers) { this.teamMembers = teamMembers; }

    public List<MilestoneResponse> getMilestones() { return milestones; }
    public void setMilestones(List<MilestoneResponse> milestones) { this.milestones = milestones; }
}
