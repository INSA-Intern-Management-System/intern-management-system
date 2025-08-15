package com.example.project_service.repository;

import com.example.project_service.models.TeamMember;

import java.util.List;
import java.util.Optional;

public interface TeamMemberReposInterface {

    // Add member to team
    TeamMember addMember(TeamMember member);
    // Add multiple members to team
    List<TeamMember> addAllMembers(List<TeamMember> members);


    // Get team members by team id
    List<TeamMember> getMembersByTeam(Long teamId);

    // Delete all members in team
    void deleteMembersByTeam(Long teamId);

    // Delete single member by id
    void deleteMemberById(Long memberId);

    // Get member by id
    Optional<TeamMember> getMemberById(Long memberId);

    // Get members by team id
    List<TeamMember> getMemberByTeamId(Long teamId);
}
