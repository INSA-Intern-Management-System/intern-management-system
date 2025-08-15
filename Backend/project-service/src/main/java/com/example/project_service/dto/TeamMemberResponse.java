package com.example.project_service.dto;

import java.util.Date;

public class TeamMemberResponse {

    private Long id;
    private Long teamId;
    private Long memberId;
    private String role;
    private Date joinedAt;

    public TeamMemberResponse() {}

    public TeamMemberResponse(Long id, Long teamId, Long memberId, String role, Date joinedAt) {
        this.id = id;
        this.teamId = teamId;
        this.memberId = memberId;
        this.role = role;
        this.joinedAt = joinedAt;
    }

    // Getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }

    public Long getMemberId() { return memberId; }
    public void setMemberId(Long memberId) { this.memberId = memberId; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Date getJoinedAt() { return joinedAt; }
    public void setJoinedAt(Date joinedAt) { this.joinedAt = joinedAt; }
}
