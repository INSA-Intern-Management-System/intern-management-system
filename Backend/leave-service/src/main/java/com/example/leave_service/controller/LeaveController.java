package com.example.leave_service.controller;

import com.example.leave_service.dto.LeaveRequest;
import com.example.leave_service.dto.LeaveResponse;
import com.example.leave_service.service.LeaveService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    private final LeaveService leaveService;

    @Autowired
    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    @PostMapping
    public ResponseEntity<?> createLeave(@RequestBody LeaveRequest leaveRequest,
                                         HttpServletRequest request) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            LeaveResponse createdLeave = leaveService.createLeave(userId, leaveRequest);
            return ResponseEntity.ok(createdLeave);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllLeaves(Pageable pageable, HttpServletRequest request) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            Page<LeaveResponse> leaves = leaveService.getLeavesByUserId(userId, pageable);
            return ResponseEntity.ok(leaves);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }


    @GetMapping("/{leaveId}")
    public ResponseEntity<?> getLeaveById(@PathVariable Long leaveId) {
        try {
            LeaveResponse leave = leaveService.getLeaveById(leaveId);
            return ResponseEntity.ok(leave);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchLeaves(@RequestParam(required = false) String leaveType,
                                          @RequestParam(required = false) String reason) {
        try {
            List<LeaveResponse> results = leaveService.searchLeaves(leaveType, reason);
            return ResponseEntity.ok(results);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    @GetMapping("/filter")
    public ResponseEntity<?> filterLeaves(@RequestParam String leaveType,
                                          @RequestParam String leaveStatus) {
        try {
            List<LeaveResponse> results = leaveService.filterLeavesByTypeAndStatus(leaveType, leaveStatus);
            return ResponseEntity.ok(results);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    @DeleteMapping("/{leaveId}")
    public ResponseEntity<?> deleteLeaveById(@PathVariable Long leaveId) {
        try {
            leaveService.deleteLeaveById(leaveId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Leave deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    @DeleteMapping
    public ResponseEntity<?> deleteAllLeaves() {
        try {
            leaveService.deleteAllLeaves();
            Map<String, String> response = new HashMap<>();
            response.put("message", "All leaves deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    @GetMapping("/status-counts")
    public ResponseEntity<?> getLeaveStatusCounts() {
        try {
            Map<String, Long> counts = leaveService.getLeaveStatusCounts();
            return ResponseEntity.ok(counts);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    @PatchMapping("/{leaveId}/status")
    public ResponseEntity<?> updateLeaveStatus(@PathVariable Long leaveId,
                                               @RequestParam String newStatus,
                                               HttpServletRequest request) {
        try {
            String role = (String) request.getAttribute("role");
            if (!"ADMIN".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized: Only ADMIN can update leave status");
            }
            LeaveResponse updated = leaveService.updateLeaveStatus(leaveId, newStatus);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    // Helper method for consistent error responses
    private ResponseEntity<Map<String, String>> errorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return ResponseEntity.status(400).body(error);
    }
}
