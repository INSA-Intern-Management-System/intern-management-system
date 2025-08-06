package com.example.project_service.repository;

import com.example.project_service.models.Team;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeamJpaRepository extends JpaRepository<Team, Long> {

    // Get teams by manager id (paged)
    Page<Team> findByManager_Id(Long managerId, Pageable pageable);

    // Get all teams (paged)
    Page<Team> findAll(Pageable pageable);
    // Find team by project id
    List<Team> findByProjectId(Long projectId);
}
