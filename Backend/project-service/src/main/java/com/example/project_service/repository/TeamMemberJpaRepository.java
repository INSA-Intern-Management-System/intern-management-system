package com.example.project_service.repository;

import com.example.project_service.models.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeamMemberJpaRepository extends JpaRepository<TeamMember, Long> {

    // Find team members by team id
    List<TeamMember> findByTeam_Id(Long teamId);

    // Delete all members in a team
    void deleteByTeam_Id(Long teamId);
}
