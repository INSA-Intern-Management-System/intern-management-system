package com.example.report_service.repository;

import com.example.report_service.model.Report;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

public interface ReportReposInterface {

    void deleteReport(Long id);
    Optional<Report> getReportById(Long reportId);
    Report saveReport(Report report);

    // User side
    Page<Report> findByUserId(Long userId, Pageable pageable);
    Page<Report> searchByTitleAndFeedback(Long userId, String keyword, Pageable pageable);
    Page<Report> filterByStatusAndDate(Long userId, String status, String period, Pageable pageable);
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

}
