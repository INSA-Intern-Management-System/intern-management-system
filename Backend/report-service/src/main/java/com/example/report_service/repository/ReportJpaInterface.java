package com.example.report_service.repository;

import com.example.report_service.dto.InternRatingProjection;
import com.example.report_service.dto.ProjectReportCountDTO;
import com.example.report_service.dto.UserReportCountDTO;
import com.example.report_service.model.Report;
import com.example.report_service.model.Status;

import jakarta.transaction.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

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
    //Double calculateAverageRatingForUsers(List<Long> userIds);

    Page<Report> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    Page<Report> findByFeedbackStatusAndCreatedAtBetween(
            Status feedbackStatus, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    Page<Report> findByFeedbackStatus(Status feedbackStatus, Pageable pageable);

    //other portions
    @Query("""
    SELECT r FROM Report r
    WHERE r.intern.id = :internId 
      AND (
           LOWER(r.title) LIKE LOWER(CONCAT('%', :title, '%')) 
           AND r.feedbackStatus = :feedbackStatus 
           AND r.createdAt BETWEEN :startDate AND :endDate
      )
        """)
        Page<Report> findReportsByInternAndFilters(
                @Param("internId") Long internId,
                @Param("title") String title,
                @Param("feedbackStatus") Status feedbackStatus,
                @Param("startDate") LocalDateTime startDate,
                @Param("endDate") LocalDateTime endDate,
                Pageable pageable);
        @Query("""
        SELECT r FROM Report r
        WHERE r.intern.id = :internId 
        AND (
                LOWER(r.title) LIKE LOWER(CONCAT('%', :title, '%')) 
                AND r.createdAt BETWEEN :startDate AND :endDate
        )
                """)
                Page<Report> findReportsByInternAndFiltersNostatus(
                        @Param("internId") Long internId,
                        @Param("title") String title,
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate,
                        Pageable pageable);

        @Query("""
        SELECT r FROM Report r
        WHERE r.intern.id = :internId
        AND LOWER(r.title) LIKE LOWER(CONCAT('%', :title, '%'))
        """)
        Page<Report> findReportsByInternAndTitle(
                @Param("internId") Long internId,
                @Param("title") String title,
                Pageable pageable);


        @Query("""
        SELECT r FROM Report r
        WHERE r.manager.id = :managerId 
        AND (
                LOWER(r.title) LIKE LOWER(CONCAT('%', :title, '%')) 
                AND r.feedbackStatus = :feedbackStatus 
                AND r.createdAt BETWEEN :startDate AND :endDate
        )
        """)
        Page<Report> findReportsByManagerAndFilters(
                @Param("managerId") Long managerId,
                @Param("title") String title,
                @Param("feedbackStatus") Status feedbackStatus,
                @Param("startDate") LocalDateTime startDate,
                @Param("endDate") LocalDateTime endDate,
                Pageable pageable);

        @Query("""
        SELECT r FROM Report r
        WHERE r.manager.id = :managerId 
        AND (
                LOWER(r.title) LIKE LOWER(CONCAT('%', :title, '%')) 
                AND r.createdAt BETWEEN :startDate AND :endDate
        )
        """)
        Page<Report> findReportsByManagerAndFiltersNoStatus(
                @Param("managerId") Long managerId,
                @Param("title") String title,
                @Param("startDate") LocalDateTime startDate,
                @Param("endDate") LocalDateTime endDate,
                Pageable pageable);

        @Query("""
        SELECT r FROM Report r
        WHERE r.manager.id = :managerId
        AND LOWER(r.title) LIKE LOWER(CONCAT('%', :title, '%'))
        """)
        Page<Report> findReportsByManagerAndTitle(
                @Param("managerId") Long managerId,
                @Param("title") String title,
                Pageable pageable);


        @Query("""
        SELECT r FROM Report r
        WHERE LOWER(r.title) LIKE LOWER(CONCAT('%', :title, '%'))
        AND r.feedbackStatus = :feedbackStatus
        AND r.createdAt BETWEEN :startDate AND :endDate
        """)
        Page<Report> findReportsByTitleOrStatusOrDate(
                @Param("title") String title,
                @Param("feedbackStatus") Status feedbackStatus,
                @Param("startDate") LocalDateTime startDate,
                @Param("endDate") LocalDateTime endDate,
                Pageable pageable);

        // @Query("""
        // SELECT r FROM Report r
        // WHERE LOWER(r.title) LIKE LOWER(CONCAT('%', :title, '%')
        // OR r.createdAt BETWEEN :startDate AND :endDate
        // """)
        // Page<Report> findReportsByTitleOrDate(
        //         @Param("title") String title,
        //         @Param("startDate") LocalDateTime startDate,
        //         @Param("endDate") LocalDateTime endDate,
        //         Pageable pageable);

        @Query("""
        SELECT r FROM Report r
        WHERE LOWER(r.title) LIKE LOWER(CONCAT('%', :title, '%'))
        AND r.createdAt BETWEEN :startDate AND :endDate
        """)
        Page<Report> findReportsByTitleOrDate(
                @Param("title") String title,
                @Param("startDate") LocalDateTime startDate,
                @Param("endDate") LocalDateTime endDate,
                Pageable pageable);

        @Query("""
        SELECT r FROM Report r
        WHERE LOWER(r.title) LIKE LOWER(CONCAT('%', :title, '%'))
        """)
        Page<Report> findReportsByTitle(
                @Param("title") String title,
                Pageable pageable);



        @Query("SELECT COUNT(r) FROM Report r WHERE r.intern.id IN :userIds")
        Long countReportsByUserIds(List<Long> userIds);
        

//        @Query("""
//         SELECT new com.example.report_service.dto.UserReportCountDTO(r.report.intern.id, COUNT(r))
//         FROM Report r
//         WHERE r.report.intern.id IN :userIds
//         GROUP BY r.report.intern.id
//                 """)
//         List<UserReportCountDTO> countReportByUserIds(@Param("userIds") List<Long> userIds);

        @Query("SELECT new com.example.report_service.dto.UserReportCountDTO(r.intern.id, COUNT(r)) " +
        "FROM Report r " +
        "WHERE r.intern.id IN :userIds " +
        "GROUP BY r.intern.id")
         List<UserReportCountDTO> countReportByUserIds(@Param("userIds") List<Long> userIds);


        @Modifying
        @Transactional
        @Query("UPDATE Report r SET r.feedbackStatus = :feedbackStatus WHERE r.id = :reportId")
        int updateFeedbackStatus(@Param("reportId") Long reportId, @Param("feedbackStatus") Status feedbackStatus);



         







}


