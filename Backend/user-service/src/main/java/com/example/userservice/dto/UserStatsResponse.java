package com.example.userservice.dto;

import lombok.Builder;

import java.util.Map;

@Builder
public class UserStatsResponse {
    private Map<String, Long> statusCounts;
    private long allUsers;
    private Map<String, Long> roleCounts;

    // Constructors
    public UserStatsResponse(Map<String, Long> statusCounts, long allUsers, Map<String, Long> roleCounts) {
        this.statusCounts = statusCounts;
        this.allUsers = allUsers;
        this.roleCounts = roleCounts;
    }

    // Getters and setters
    public Map<String, Long> getStatusCounts() { return statusCounts; }
    public void setStatusCounts(Map<String, Long> statusCounts) { this.statusCounts = statusCounts; }

    public long getAllUsers() { return allUsers; }
    public void setAllUsers(long allUsers) { this.allUsers = allUsers; }

    public Map<String, Long> getRoleCounts() { return roleCounts; }
    public void setRoleCounts(Map<String, Long> roleCounts) { this.roleCounts = roleCounts; }
}

