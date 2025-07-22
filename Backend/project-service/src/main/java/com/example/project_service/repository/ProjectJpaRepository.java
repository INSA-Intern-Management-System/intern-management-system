package com.example.project_service.repository;

import com.example.project_service.models.Project;
import com.example.project_service.models.ProjectStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectJpaRepository extends JpaRepository<Project, Long> {

    // Search by name (contains, case-insensitive)
    Page<Project> findByNameContainingIgnoreCase(String name, Pageable pageable);

    // Search by technology (contains, case-insensitive)
    Page<Project> findByTechnologiesContainingIgnoreCase(String technology, Pageable pageable);

    // Find projects by creator (paged)
    Page<Project> findByCreatedById(Long createdById, Pageable pageable);

    // Find projects by creator and name
    Page<Project> findByCreatedByIdAndNameContainingIgnoreCase(Long createdById, String name, Pageable pageable);

    // Find projects by creator and technology
    Page<Project> findByCreatedByIdAndTechnologiesContainingIgnoreCase(Long createdById, String technology, Pageable pageable);

    // Count by creator
    Long countByCreatedById(Long createdById);

    // Count by creator and status
    Long countByCreatedByIdAndStatus(Long createdById, ProjectStatus status);

    // Count by status
    Long countByStatus(ProjectStatus status);
}

