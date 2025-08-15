package com.example.report_service.repository;

import com.example.report_service.model.Report;
import com.example.report_service.model.Status;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public class ReportInterfaceImpl implements ReportReposInterface {

    private final ReportJpaInterface reportJpa;

    @Autowired
    public ReportInterfaceImpl(ReportJpaInterface reportJpa) {
        this.reportJpa = reportJpa;
    }

    @Override
    public Report saveReport(Report report) {
        return reportJpa.save(report);
    }

    @Override
    public Long countByUserId(Long userId) {
        return reportJpa.countByIntern_Id(userId);
    }

    @Override
    public Long countPendingByManagerId(Long managerId) {
        return reportJpa.countByManager_IdAndFeedbackStatus(managerId, Status.PENDING);
    }

    @Override
    public Long countReviewedByManagerId(Long managerId) {
        return reportJpa.countByManager_IdAndFeedbackStatus(managerId, Status.GIVEN);
    }

    @Override
    public Page<Report> findByUserId(Long userId, Pageable pageable) {
        return reportJpa.findByIntern_Id(userId, pageable);
    }

    @Override
    public Page<Report> searchByTitleAndFeedback(Long userId, String keyword, Pageable pageable) {
        return reportJpa.findByIntern_IdAndTitleContainingIgnoreCase(userId, keyword, pageable);
    }

    @Override
    public Page<Report> filterByStatusAndDate(Long userId, String status, String period, Pageable pageable) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startDate = getStartDateByPeriod(period);

        if (startDate != null) {
            return reportJpa.findByIntern_IdAndTitleContainingIgnoreCaseAndFeedbackStatusAndCreatedAtBetween(
                    userId, "", Status.valueOf(status.toUpperCase()), startDate, now, pageable);
        } else {
            return reportJpa.findByIntern_IdAndTitleContainingIgnoreCaseAndFeedbackStatus(
                    userId, "", Status.valueOf(status.toUpperCase()), pageable);
        }
    }

    @Override
    public Page<Report> findByManagerId(Long managerId, Pageable pageable) {
        return reportJpa.findByManager_Id(managerId, pageable);
    }

    @Override
    public Page<Report> searchByManagerAndTitle(Long managerId, String title, Pageable pageable) {
        return reportJpa.findByManager_IdAndTitleContainingIgnoreCase(managerId, title, pageable);
    }

    @Override
    public Page<Report> filterByManagerAndStatusAndDate(Long managerId, String status, String period, Pageable pageable) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startDate = getStartDateByPeriod(period);

        if (startDate != null) {
            return reportJpa.findByManager_IdAndFeedbackStatusAndCreatedAtBetween(
                    managerId, Status.valueOf(status.toUpperCase()), startDate, now, pageable);
        } else {
            return reportJpa.findByManager_IdAndFeedbackStatus(
                    managerId, Status.valueOf(status.toUpperCase()), pageable);
        }
    }

    @Override
    public Optional<Report> getReportById(Long reportId) {
        return reportJpa.findById(reportId);
    }

    @Override
    public void deleteReport(Long reportId) {
        if (reportJpa.existsById(reportId)) {
            reportJpa.deleteById(reportId);
        } else {
            throw new RuntimeException("Report not found with ID: " + reportId);
        }
    }

    // ✅ Generic methods (not dependent on userId or managerId)
    @Override
    public Page<Report> findAllReports(Pageable pageable) {
        return reportJpa.findAll(pageable);
    }

    @Override
    public Page<Report> searchAllByTitle(String title, Pageable pageable) {
        return reportJpa.findByTitleContainingIgnoreCase(title, pageable);
    }

    @Override
    public Page<Report> filterAllByStatusAndDate(String status, String period, Pageable pageable) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startDate = getStartDateByPeriod(period);

        if (startDate != null) {
            return reportJpa.findByFeedbackStatusAndCreatedAtBetween(
                    Status.valueOf(status.toUpperCase()), startDate, now, pageable);
        } else {
            return reportJpa.findByFeedbackStatus(Status.valueOf(status.toUpperCase()), pageable);
        }
    }

    @Override
    public Long countAllReports() {
        return reportJpa.countBy();
    }

    @Override
    public Long countAllByFeedbackStatus(String status) {
        return reportJpa.countByFeedbackStatus(Status.valueOf(status.toUpperCase()));
    }

    // Helper
    private LocalDateTime getStartDateByPeriod(String period) {
        LocalDateTime now = LocalDateTime.now();
        if ("week".equalsIgnoreCase(period)) {
            return now.minusWeeks(1);
        } else if ("month".equalsIgnoreCase(period)) {
            return now.minusMonths(1);
        } else {
            return null;
        }
    }
}
