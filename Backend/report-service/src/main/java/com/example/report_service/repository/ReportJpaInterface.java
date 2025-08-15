package com.example.report_service.repository;

import com.example.report_service.model.Report;
import com.example.report_service.model.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface ReportJpaInterface extends JpaRepository<Report, Long> {

    Long countBy(); // total count

    Long countByFeedbackStatus(Status status);

    Long countByIntern_Id(Long internId);

    Long countByManager_IdAndFeedbackStatus(Long managerId, Status status);

    Page<Report> findByIntern_Id(Long internId, Pageable pageable);

    Page<Report> findByIntern_IdAndTitleContainingIgnoreCase(Long internId, String title, Pageable pageable);

    Page<Report> findByIntern_IdAndTitleContainingIgnoreCaseAndFeedbackStatusAndCreatedAtBetween(
            Long internId, String title, Status feedbackStatus, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    Page<Report> findByIntern_IdAndTitleContainingIgnoreCaseAndFeedbackStatus(
            Long internId, String title, Status feedbackStatus, Pageable pageable);

    Page<Report> findByIntern_IdAndTitleContainingIgnoreCaseAndCreatedAtBetween(
            Long internId, String title, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    // Manager side
    Page<Report> findByManager_Id(Long managerId, Pageable pageable);

    Page<Report> findByManager_IdAndTitleContainingIgnoreCase(Long managerId, String title, Pageable pageable);

    Page<Report> findByManager_IdAndFeedbackStatusAndCreatedAtBetween(
            Long managerId, Status feedbackStatus, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    Page<Report> findByManager_IdAndFeedbackStatus(Long managerId, Status feedbackStatus, Pageable pageable);

    Page<Report> findByManager_IdAndCreatedAtBetween(
            Long managerId, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    // Generic
    Page<Report> findAll(Pageable pageable);

    Page<Report> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    Page<Report> findByFeedbackStatusAndCreatedAtBetween(
            Status feedbackStatus, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    Page<Report> findByFeedbackStatus(Status feedbackStatus, Pageable pageable);
}

