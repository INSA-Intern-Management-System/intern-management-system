package com.example.project_service.dto;

public class TeamMemberRequest {

    private Long teamId;
    private Long memberId;
    private String role;

    public TeamMemberRequest() {}

    public TeamMemberRequest(Long teamId, Long memberId, String role) {
        this.teamId = teamId;
        this.memberId = memberId;
        this.role = role;
    }

    // Getters & setters
    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }

    public Long getMemberId() { return memberId; }
    public void setMemberId(Long memberId) { this.memberId = memberId; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
