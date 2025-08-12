package com.example.project_service.repository;

import com.example.project_service.models.TeamMember;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class TeamMemberReposImp implements TeamMemberReposInterface {

    private final TeamMemberJpaRepository teamMemberJpaRepository;

    @Autowired
    public TeamMemberReposImp(TeamMemberJpaRepository teamMemberJpaRepository) {
        this.teamMemberJpaRepository = teamMemberJpaRepository;
    }

    @Override
    public TeamMember addMember(TeamMember member) {
        return teamMemberJpaRepository.save(member);
    }

    @Override
    public List<TeamMember> getMembersByTeam(Long teamId) {
        return teamMemberJpaRepository.findByTeam_Id(teamId);
    }

    @Override
    public void deleteMembersByTeam(Long teamId) {
        teamMemberJpaRepository.deleteByTeam_Id(teamId);
    }

    @Override
    public void deleteMemberById(Long memberId) {
        teamMemberJpaRepository.deleteById(memberId);
    }

    @Override
    public Optional<TeamMember> getMemberById(Long memberId) {
        return teamMemberJpaRepository.findFirstByMember_IdOrderByIdAsc(memberId);
    }
    
    @Override
    public List<TeamMember> getMemberByTeamId(Long teamId) {
        return teamMemberJpaRepository.findByTeam_Id(teamId);
    }
    @Override
    public List<TeamMember> addAllMembers(List<TeamMember> members) {
        return teamMemberJpaRepository.saveAll(members);
    }
}
