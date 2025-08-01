package com.example.project_service.dto;

import jakarta.validation.constraints.*;

public class TeamMemberRequest {

    @NotNull(message = "Team ID must not be null")
    private Long teamId;

    @NotNull(message = "Member ID must not be null")
    private Long memberId;

    @NotBlank(message = "Role must not be blank")
    @Size(max = 50, message = "Role must not exceed 50 characters")
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
