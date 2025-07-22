package com.example.project_service.dto;

import java.util.HashMap;

public class TeamRequest {

    private Long projectId;
    private String name;
    private Long managerId;
    private HashMap<String,String> members;

    public TeamRequest() {}

    public TeamRequest(Long projectId, String name, Long managerId, HashMap<String,String> memberIds) {
        this.projectId = projectId;
        this.name = name;
        this.managerId = managerId;
        this.members = memberIds;
    }

    // Getters & setters
    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Long getManagerId() { return managerId; }
    public void setManagerId(Long managerId) { this.managerId = managerId; }
    public HashMap<String,String> getMembers() { return members; }
    public void setMembers(HashMap<String,String> members) { this.members = members; }
}
