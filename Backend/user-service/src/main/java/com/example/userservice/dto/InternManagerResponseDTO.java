package com.example.userservice.dto;
public class InternManagerResponseDTO {
    private Long id;
    private Long userId;
    private Long managerId;
    private Long projectId;
    private Long mentorId;
    private Long teamId;

    public InternManagerResponseDTO() {
    }

    public InternManagerResponseDTO(Long id, Long userId, Long managerId, Long projectId, Long mentorId, Long teamId) {
        this.id = id;
        this.userId = userId;
        this.managerId = managerId;
        this.projectId = projectId;
        this.mentorId = mentorId;
        this.teamId = teamId;
    }

    // Getters & setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getManagerId() {
        return managerId;
    }

    public void setManagerId(Long managerId) {
        this.managerId = managerId;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public Long getMentorId() {
        return mentorId;
    }

    public void setMentorId(Long mentorId) {
        this.mentorId = mentorId;
    }

    public Long getTeamId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }
}
