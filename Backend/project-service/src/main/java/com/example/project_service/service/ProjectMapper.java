package com.example.project_service.service;

import com.example.project_service.dto.*;
import com.example.project_service.models.*;

import org.springframework.stereotype.Component;

@Component
public class ProjectMapper {

    public ProjectResponse mapToDto(Project project) {
        if (project == null) return null;
        ProjectResponse dto = new ProjectResponse();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setStatus(project.getStatus());
        dto.setStartDate(project.getStartDate());
        dto.setEndDate(project.getEndDate());
        dto.setBudget(project.getBudget());
        dto.setTechnologies(project.getTechnologies());
        dto.setCreatedBy(project.getCreatedBy().getId());
        dto.setCreatedAt(project.getCreatedAt());
        dto.setUpdatedAt(project.getUpdatedAt());
        return dto;
    }

    public TeamResponse mapToDto(Team team) {
        if (team == null) return null;
        TeamResponse dto = new TeamResponse();
        dto.setId(team.getId());
        dto.setProjectId(team.getProject() != null ? team.getProject().getId() : null);
        dto.setName(team.getName());
        dto.setManagerId(team.getManagerId());
        dto.setCreatedAt(team.getCreatedAt());
        dto.setUpdatedAt(team.getUpdatedAt());
        return dto;
    }

    public TeamMemberResponse mapToDto(TeamMember member) {
        if (member == null) return null;
        TeamMemberResponse dto = new TeamMemberResponse();
        dto.setId(member.getId());
        dto.setTeamId(member.getTeam() != null ? member.getTeam().getId() : null);
        dto.setMemberId(member.getMemberId());
        dto.setRole(member.getRole());
        dto.setJoinedAt(member.getJoinedAt());
        return dto;
    }

    public MilestoneResponse mapToDto(Milestone milestone) {
        if (milestone == null) return null;
        MilestoneResponse dto = new MilestoneResponse();
        dto.setId(milestone.getId());
        dto.setProjectId(milestone.getProject() != null ? milestone.getProject().getId() : null);
        dto.setTitle(milestone.getTitle());
        dto.setDescription(milestone.getDescription());
        dto.setStatus(milestone.getStatus());
        dto.setDueDate(milestone.getDueDate());
        dto.setCreatedAt(milestone.getCreatedAt());
        dto.setUpdatedAt(milestone.getUpdatedAt());
        return dto;
    }
}
