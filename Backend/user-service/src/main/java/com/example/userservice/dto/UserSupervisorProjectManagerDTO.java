package com.example.userservice.dto;

public class UserSupervisorProjectManagerDTO {

    private SimpleUserDto supervisor;
    private SimpleUserDto projectManager;

    public UserSupervisorProjectManagerDTO(UserResponseDto userResponseDto) {
        this.supervisor = userResponseDto.getSupervisor();
        this.projectManager = userResponseDto.getProjectManager();
    }

    public SimpleUserDto getSupervisor() {
        return supervisor;
    }

    public void setSupervisor(SimpleUserDto supervisor) {
        this.supervisor = supervisor;
    }

    public SimpleUserDto getProjectManager() {
        return projectManager;
    }

    public void setProjectManager(SimpleUserDto projectManager) {
        this.projectManager = projectManager;
    }
}
