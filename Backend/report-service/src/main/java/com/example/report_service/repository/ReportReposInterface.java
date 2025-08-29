package com.example.report_service.repository;

import com.example.report_service.dto.ProjectReportCountDTO;
import com.example.report_service.dto.UserReportCountDTO;
import com.example.report_service.model.Report;
import com.example.report_service.model.Status;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ReportReposInterface {

    void deleteReport(Long id);
    Optional<Report> getReportById(Long reportId);
    Report saveReport(Report report);

    // User side
    Page<Report> findByUserId(Long userId, Pageable pageable);
    Page<Report> searchByTitleAndFeedback(Long userId, String keyword, Pageable pageable);
    Page<Report> filterByStatusAndDate(Long userId, String status, String period, Pageable pageable);
    // Page<Report> findReportsByInternAndFilters(
    //             @Param("internId") Long internId,
    //             @Param("title") String title,
    //             @Param("feedbackStatus") Status feedbackStatus,
    //             @Param("startDate") LocalDateTime startDate,
    //             @Param("endDate") LocalDateTime endDate,
    //             Pageable pageable);
    Page<Report> findReportsByInternAndFilters(Long internId,String title,String feedbackStatus,String period,Pageable pageable);
    Page<Report> findReportsByManagerAndFilters(Long managerId,String title,String feedbackStatus,String period,Pageable pageable);         
    Page<Report> findReportsByTitleOrStatusOrDate(String title,String feedbackStatus, String period,Pageable pageable);




    Long countByUserId(Long userId);

    // Manager side
    Page<Report> findByManagerId(Long managerId, Pageable pageable);
    Page<Report> searchByManagerAndTitle(Long managerId, String title, Pageable pageable);
    Page<Report> filterByManagerAndStatusAndDate(Long managerId, String status, String period, Pageable pageable);
    Long countPendingByManagerId(Long managerId);
    Long countReviewedByManagerId(Long managerId);

    //Generic / Admin / All reports
    Page<Report> findAllReports(Pageable pageable);
    Page<Report> searchAllByTitle(String title, Pageable pageable);
    Page<Report> filterAllByStatusAndDate(String status, String peroid, Pageable pageable);
    Long countAllReports();
    Long countAllByFeedbackStatus(String status);
    Long countReportsByUserIds(List<Long> userIds);
    List<UserReportCountDTO> countReportByUserIds(@Param("userIds") List<Long> userIds);

    //update feedbackstatus for report
    int updateFeedbackStatus(Long reportId,Status feedbackStatus);


    //for searching 
    Page<Report> findReportsByInternAndTitle(Long internId, String title,Pageable pageable);
    Page<Report> findReportsByManagerAndTitle(Long managerId, String title,Pageable pageable);
    Page<Report> findReportsByTitle(String title,Pageable pageable);

}
