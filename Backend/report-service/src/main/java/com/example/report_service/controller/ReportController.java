package com.example.report_service.controller;
import com.example.report_service.dto.*;
import com.example.report_service.service.ReportService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    @Autowired
    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    /**
     * Intern: create new report
     * POST /api/reports
     */
    @PostMapping
    public ResponseEntity<?> createReport(HttpServletRequest request, @RequestBody ReportRequestDTO dto) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            String role = (String) request.getAttribute("role");
            if (!"STUDENT".equalsIgnoreCase(role)) {
                return ResponseEntity.status(403).body("Access denied: Only students can create reports");
            }

            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Missing or invalid Authorization header");
            }
            String jwtToken = authHeader.substring(7); // Remove "Bearer "

            ReportResponseDTO created = reportService.createReport(jwtToken, userId, dto);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }



    /**
     * Intern: get own reports with their reviews (paginated)
     * GET /api/reports/my
     */
    @GetMapping("/my")
    public ResponseEntity<?> getMyReports(HttpServletRequest request, Pageable pageable) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            String role = (String) request.getAttribute("role");
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Missing or invalid Authorization header");
            }
            String jwtToken = authHeader.substring(7);

            if (!"STUDENT".equalsIgnoreCase(role) && !"PROJECT_MANAGER".equalsIgnoreCase(role) && "HR".equalsIgnoreCase(role)) {
                return ResponseEntity.status(403).body("Access denied: Only students OR pm can view their reports");
            }
            if ("STUDENT".equalsIgnoreCase(role)) {
                Page<ReportResponseDTO> reports = reportService.getReportsWithReviews(jwtToken,userId, pageable);
                return ResponseEntity.ok(reports);
            } else if ("PROJECT_MANAGER".equalsIgnoreCase(role)) {
                Page<ReportResponseDTO> reports = reportService.getReportsByManagerId(jwtToken,userId, pageable);
                return ResponseEntity.ok(reports);
            } else if ("HR".equalsIgnoreCase(role)) {
                Page<ReportResponseDTO> reports = reportService.getAllReportsWithReviews(jwtToken,pageable);
                return ResponseEntity.ok(reports);
            } else {
                return ResponseEntity.status(403).body("Access denied: Invalid role");
                
            }
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    /**
     * Intern: search own reports by keyword
     * GET /api/reports/my/search?keyword=...
     */
    @GetMapping("/my/search")
    public ResponseEntity<?> searchMyReports(HttpServletRequest request,
                                             @RequestParam String keyword,
                                             Pageable pageable) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            String role = (String) request.getAttribute("role");
            if (!"STUDENT".equalsIgnoreCase(role) && !"PROJECT_MANAGER".equalsIgnoreCase(role) && "HR".equalsIgnoreCase(role)) {
                return ResponseEntity.status(403).body("Access denied: Only students OR pm can search their reports");
            }
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Missing or invalid Authorization header");
            }
            String jwtToken = authHeader.substring(7);

            if ("STUDENT".equalsIgnoreCase(role)) {
                Page<ReportResponseDTO> results = reportService.searchReports(jwtToken,userId, keyword, pageable);
                return ResponseEntity.ok(results);
            } else if ("PROJECT_MANAGER".equalsIgnoreCase(role)) {
                Page<ReportResponseDTO> results = reportService.searchManagerReports(jwtToken,userId, keyword, pageable);
                return ResponseEntity.ok(results);
            } else if ("HR".equalsIgnoreCase(role)) {
                Page<ReportResponseDTO> results = reportService.searchAllReports(jwtToken,keyword, pageable);
                return ResponseEntity.ok(results);
            } else {
                return ResponseEntity.status(403).body("Access denied: Invalid role");
            }

        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    /**
     * Intern: filter own reports by status & period
     * GET /api/reports/my/filter?status=...&period=...
     */
    @GetMapping("/my/filter")
    public ResponseEntity<?> filterMyReports(HttpServletRequest request,
                                             @RequestParam String status,
                                             @RequestParam String period,
                                             Pageable pageable) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            String role = (String) request.getAttribute("role");
            if (!"STUDENT".equalsIgnoreCase(role) && !"PROJECT_MANAGER".equalsIgnoreCase(role) && "HR".equalsIgnoreCase(role)) {
                return ResponseEntity.status(403).body("Access denied: Only students OR pm can filter their reports");
            }
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Missing or invalid Authorization header");
            }
            String jwtToken = authHeader.substring(7);
            if ("STUDENT".equalsIgnoreCase(role)) {
                Page<ReportResponseDTO> filtered = reportService.filterReports(jwtToken,userId, status, period, pageable);
                return ResponseEntity.ok(filtered);
            } else if ("PROJECT_MANAGER".equalsIgnoreCase(role)) {
                Page<ReportResponseDTO> filtered = reportService.filterManagerReports(jwtToken,userId, status, period, pageable);
                return ResponseEntity.ok(filtered);
            } else if ("HR".equalsIgnoreCase(role)) {
                Page<ReportResponseDTO> filtered = reportService.filterAllReports(jwtToken,status, period, pageable);
                return ResponseEntity.ok(filtered);
            } else {
                return ResponseEntity.status(403).body("Access denied: Invalid role");
            }
            
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    /**
     * Intern: get report stats
     * GET /api/reports/my/stats
     */
    @GetMapping("/my/stats")
    public ResponseEntity<?> getMyReportStats(HttpServletRequest request) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            String role = (String) request.getAttribute("role");
            if (!"STUDENT".equalsIgnoreCase(role) && !"PROJECT_MANAGER".equalsIgnoreCase(role) && "HR".equalsIgnoreCase(role)) {
                return ResponseEntity.status(403).body("Access denied: Only students OR pm  can view their report stats");
            }
            if ("STUDENT".equalsIgnoreCase(role)) {
                 ReportStatsDTO stats = reportService.getUserReportStats(userId);
                return ResponseEntity.ok(stats);
            } else if ("PROJECT_MANAGER".equalsIgnoreCase(role)) {
                ManagerReportStatsDTO stats = reportService.getManagerReportStats(userId);
                return ResponseEntity.ok(stats);
            }else if ("HR".equalsIgnoreCase(role)) {
                GenericStatsDTO stats = reportService.getGlobalReportStats();
                return ResponseEntity.ok(stats);
            } else {
                return ResponseEntity.status(403).body("Access denied: Invalid role");
            }
           
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }


    /**
     * Manager: create review for report
     * POST /api/reports/manager/review
     */
    @PostMapping("/manager/review")
    public ResponseEntity<?> createReview(HttpServletRequest request, @RequestBody ReviewRequestDTO dto) {
        try {
            Long managerId = (Long) request.getAttribute("userId");
            String role = (String) request.getAttribute("role");
            if (!"PROJECT_MANAGER".equalsIgnoreCase(role)) {
                return ResponseEntity.status(403).body("Access denied: Only project managers can create reviews");
            }
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Missing or invalid Authorization header");
            }
            String jwtToken = authHeader.substring(7);
            ReportResponseDTO response = reportService.createReview(jwtToken,managerId, dto);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    /**
     * Consistent error response helper
     */
    private ResponseEntity<Map<String, String>> errorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return ResponseEntity.badRequest().body(error);
    }
}
