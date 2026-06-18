package com.example.schedule_service.controller;

import com.example.schedule_service.dto.ScheduleRequest;
import com.example.schedule_service.dto.ScheduleResponse;
import com.example.schedule_service.model.ScheduleStatus;
import com.example.schedule_service.service.ScheduleService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    @Autowired
    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @PostMapping
    public ResponseEntity<?> createSchedule(@RequestBody ScheduleRequest request,
                                            HttpServletRequest httpRequest) {
        try {
            if (!isStudent(httpRequest)) return unauthorized();
            Long userId = (Long) httpRequest.getAttribute("userId");

            // ✅ Get JWT from HttpOnly cookie
            String jwtToken = null;
            if (httpRequest.getCookies() != null) {
                for (Cookie cookie : httpRequest.getCookies()) {
                    if ("access_token".equals(cookie.getName())) {
                        jwtToken = cookie.getValue();
                        break;
                    }
                }
            }

            if (jwtToken == null) {
                return ResponseEntity.status(401).body("Missing access_token cookie");
            }
            ScheduleResponse created = scheduleService.createSchedule(jwtToken,userId, request);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllSchedules(Pageable pageable, HttpServletRequest httpRequest) {
        try {
            if (!isStudent(httpRequest)) return unauthorized();
            Long userId = (Long) httpRequest.getAttribute("userId");

            // ✅ Get JWT from HttpOnly cookie
            String jwtToken = null;
            if (httpRequest.getCookies() != null) {
                for (Cookie cookie : httpRequest.getCookies()) {
                    if ("access_token".equals(cookie.getName())) {
                        jwtToken = cookie.getValue();
                        break;
                    }
                }
            }

            if (jwtToken == null) {
                return ResponseEntity.status(401).body("Missing access_token cookie");
            }

            HashMap<String ,Object> result = scheduleService.getSchedulesByUserId(jwtToken,userId, pageable);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchSchedules(@RequestParam(required = false) String query,
                                              Pageable pageable,
                                             HttpServletRequest httpRequest) {
        try {
            if (!isStudent(httpRequest)) return unauthorized();
            if (query == null || query.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Query parameter is required");
            }
            Long userId = (Long) httpRequest.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.status(401).body("Unauthorized: User ID not found");
            }
            Page<ScheduleResponse> results = scheduleService.searchSchedules(userId,query, pageable);
            return ResponseEntity.ok(results);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    @GetMapping("/filter")
    public ResponseEntity<?> filterSchedulesByStatus(@RequestParam ScheduleStatus status,
                                                    Pageable pageable,
                                                     HttpServletRequest httpRequest) {
        try {
            if (!isStudent(httpRequest)) return unauthorized();
            Long userId = (Long) httpRequest.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.status(401).body("Unauthorized: User ID not found");
            }
         
            Page<ScheduleResponse> results = scheduleService.filterSchedulesByStatus(userId,status, pageable);
            return ResponseEntity.ok(results);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    @GetMapping("/status-counts")
    public ResponseEntity<?> getScheduleStatusCounts(HttpServletRequest httpRequest) {
        try {
            if (!isStudent(httpRequest)) return unauthorized();
            Long userId = (Long) httpRequest.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.status(401).body("Unauthorized: User ID not found");
            }
            Map<String, Long> counts = scheduleService.getScheduleStatusCounts(userId);
            return ResponseEntity.ok(counts);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    @GetMapping("/due-after")
    public ResponseEntity<?> findSchedulesByDueDateAfter(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date date,
            Pageable pageable,
            HttpServletRequest httpRequest) {
        try {
            if (!isStudent(httpRequest)) return unauthorized();
            Long userId = (Long) httpRequest.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.status(401).body("Unauthorized: User ID not found");
            }
            Page<ScheduleResponse> results = scheduleService.findSchedulesByDueDateAfter(userId,date, pageable);
            return ResponseEntity.ok(results);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    @GetMapping("/upcoming")
    public ResponseEntity<?> findUpcomingSchedules(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date beforeDate,
            Pageable pageable,
            HttpServletRequest httpRequest) {
        try {
            if (!isStudent(httpRequest)) return unauthorized();
            Long userId = (Long) httpRequest.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.status(401).body("Unauthorized: User ID not found");
            }
            Page<ScheduleResponse> results = scheduleService.findUpcomingSchedules(userId,beforeDate, pageable);
            return ResponseEntity.ok(results);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    @DeleteMapping
    public ResponseEntity<?> deleteAllSchedules(HttpServletRequest httpRequest) {
        try {
            if (!isStudent(httpRequest)) return unauthorized();
            Long userId = (Long) httpRequest.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.status(401).body("Unauthorized: User ID not found");
            }

            // ✅ Get JWT from HttpOnly cookie
            String jwtToken = null;
            if (httpRequest.getCookies() != null) {
                for (Cookie cookie : httpRequest.getCookies()) {
                    if ("access_token".equals(cookie.getName())) {
                        jwtToken = cookie.getValue();
                        break;
                    }
                }
            }

            if (jwtToken == null) {
                return ResponseEntity.status(401).body("Missing access_token cookie");
            }
            scheduleService.deleteAllSchedules(jwtToken, userId);
            Map<String, String> res = new HashMap<>();
            res.put("message", "All schedules deleted successfully");
            return ResponseEntity.ok(res);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    @DeleteMapping("/{scheduleId}")
    public ResponseEntity<?> deleteScheduleById(@PathVariable Long scheduleId,
                                                HttpServletRequest httpRequest) {
        try {
            if (!isStudent(httpRequest)) return unauthorized();
            Long userId = (Long) httpRequest.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.status(401).body("Unauthorized: User ID not found");
            }
            // ✅ Get JWT from HttpOnly cookie
            String jwtToken = null;
            if (httpRequest.getCookies() != null) {
                for (Cookie cookie : httpRequest.getCookies()) {
                    if ("access_token".equals(cookie.getName())) {
                        jwtToken = cookie.getValue();
                        break;
                    }
                }
            }

            if (jwtToken == null) {
                return ResponseEntity.status(401).body("Missing access_token cookie");
            }

            scheduleService.deleteScheduleById(jwtToken,userId,scheduleId);
            Map<String, String> res = new HashMap<>();
            res.put("message", "Schedule deleted successfully");
            return ResponseEntity.ok(res);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    @PatchMapping("/{scheduleId}/status")
    public ResponseEntity<?> updateScheduleStatus(@PathVariable Long scheduleId,
                                                  @RequestParam ScheduleStatus newStatus,
                                                  HttpServletRequest httpRequest) {
        try {
            if (!isStudent(httpRequest)) return unauthorized();
            Long userId = (Long) httpRequest.getAttribute("userId");

            if (userId == null) {
                return ResponseEntity.status(401).body("Unauthorized: User ID not found");
            }
            
            // ✅ Get JWT from HttpOnly cookie
            String jwtToken = null;
            if (httpRequest.getCookies() != null) {
                for (Cookie cookie : httpRequest.getCookies()) {
                    if ("access_token".equals(cookie.getName())) {
                        jwtToken = cookie.getValue();
                        break;
                    }
                }
            }

            if (jwtToken == null) {
                return ResponseEntity.status(401).body("Missing access_token cookie");
            }
            ScheduleResponse updated = scheduleService.updateScheduleStatus(jwtToken, userId,scheduleId, newStatus);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    @GetMapping("/{scheduleId}")
    public ResponseEntity<?> getScheduleById(@PathVariable Long scheduleId,
                                             HttpServletRequest httpRequest) {
        try {
            if (!isStudent(httpRequest)) return unauthorized();
            Long userId = (Long) httpRequest.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.status(401).body("Unauthorized: User ID not found");
            }

            ScheduleResponse schedule = scheduleService.getScheduleById(userId,scheduleId);
            return ResponseEntity.ok(schedule);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    // Helper: check if user role is student
    private boolean isStudent(HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        return "Student".equalsIgnoreCase(role);
    }

    // Helper: unauthorized response
    private ResponseEntity<Map<String, String>> unauthorized() {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Unauthorized: Only Student can access this endpoint");
        return ResponseEntity.status(403).body(error);
    }

    // Helper: error response
    private ResponseEntity<Map<String, String>> errorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return ResponseEntity.status(400).body(error);
    }
}
