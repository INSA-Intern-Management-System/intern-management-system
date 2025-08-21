package com.example.userservice.dto;

public class UserSupervisorProjectManagerDTO {

    private SupervisorDTO supervisor;
    private ProjectManagerDTO projectManager;

    public UserSupervisorProjectManagerDTO(UserResponseDto userResponseDto) {
        this.supervisor = userResponseDto.getSupervisor();
        this.projectManager = userResponseDto.getProjectManager();
    }

    public SupervisorDTO getSupervisor() {
        return supervisor;
    }

    public void setSupervisor(SupervisorDTO supervisor) {
        this.supervisor = supervisor;
    }

    public ProjectManagerDTO getProjectManager() {
        return projectManager;
    }

    public void setProjectManager(ProjectManagerDTO projectManager) {
        this.projectManager = projectManager;
    }
}
