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
            String role = (String) request.getAttribute("role");
            if (!"STUDENT".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized: Only INTERN can create leave requests");
            }
            LeaveResponse createdLeave = leaveService.createLeave(userId, leaveRequest);
            return ResponseEntity.ok(createdLeave);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllLeavesRequests(Pageable pageable, HttpServletRequest request) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            String role = (String) request.getAttribute("role");
            if (!"STUDENT".equalsIgnoreCase(role) && !"PROJECT_MANAGER".equalsIgnoreCase(role) && !"HR".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized: Only INTERN or ADMIN can view leaves");
            }

            if("PROJECT_MANAGER".equalsIgnoreCase(role)){
                Page<LeaveResponse> leaves = leaveService.getLeavesByManager(userId, pageable);
                return ResponseEntity.ok(leaves);
            }else if("HR".equalsIgnoreCase(role)){
                Page<LeaveResponse> leaves = leaveService.getAllLeaves(pageable);
                return ResponseEntity.ok(leaves);

            }else{
                Page<LeaveResponse> leaves = leaveService.getLeavesByUserId(userId, pageable);
                return ResponseEntity.ok(leaves);
            }
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    @DeleteMapping
    public ResponseEntity<?> deleteAllLeaves(HttpServletRequest request) {
        try {
            String role = (String) request.getAttribute("role");
            Long userId = (Long) request.getAttribute("userId");
            if(!"STUDENT".equalsIgnoreCase(role)){
                return errorResponse("Unauthorized: Only STUDENT can delete leaves");
            }
            leaveService.deleteAllLeaves(userId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "All leaves deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchLeaves(@RequestParam(required = false) String leaveType,
                                          @RequestParam(required = false) String reason,
                                          HttpServletRequest request,
                                          Pageable pageable) {
        try {
            String role = (String) request.getAttribute("role");
            Long userId = (Long) request.getAttribute("userId");

            if ("PROJECT_MANAGER".equalsIgnoreCase(role) && !"HR".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized: Only STUDENT, PROJECT_MANAGER, or HR can search leaves");
            }

            if("HR".equalsIgnoreCase(role)){
                Page<LeaveResponse> results = leaveService.searchLeaves(leaveType, reason,pageable);
                return ResponseEntity.ok(results);
            }else{
                Page<LeaveResponse> results = leaveService.searchLeaves(userId,leaveType, reason,pageable);
                return ResponseEntity.ok(results);
            }
            
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    @GetMapping("/filter")
    public ResponseEntity<?> filterLeaves(@RequestParam String leaveType,
                                          @RequestParam String leaveStatus,
                                          HttpServletRequest request,
                                          Pageable pageable) {
        try {
            String role = (String) request.getAttribute("role");
            Long userId = (Long) request.getAttribute("userId");

            if (!"PROJECT_MANAGER".equalsIgnoreCase(role) && !"HR".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized: PROJECT_MANAGER, or HR can filter leaves");
            }

            if("HR".equalsIgnoreCase(role)){
                Page<LeaveResponse> results = leaveService.filterLeavesByTypeAndStatus(leaveType, leaveStatus,pageable);
                return ResponseEntity.ok(results);
            }else{
                Page<LeaveResponse> results = leaveService.filterLeavesByTypeAndStatus(userId,leaveType, leaveStatus,pageable);
                return ResponseEntity.ok(results);
            }

        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }



    @GetMapping("/status-counts")
    public ResponseEntity<?> getLeaveStatusCounts(HttpServletRequest request) {
        try {
            String role = (String) request.getAttribute("role");
            Long userId = (Long) request.getAttribute("userId");

            if(!"PROJECT_MANAGER".equalsIgnoreCase(role) || !"HR".equalsIgnoreCase(role)){
                return errorResponse("Unauthorized: Only PROJECT_MANAGER and HR can view leave status counts");
            }
            if ("HR".equalsIgnoreCase(role)) {
                Map<String, Long> counts = leaveService.getLeaveStatusCounts();
                return ResponseEntity.ok(counts);
            }else{
                Map<String, Long> counts = leaveService.getLeaveStatusCounts(userId);
                return ResponseEntity.ok(counts);
            }
            
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    @DeleteMapping("/{leaveId}")
    public ResponseEntity<?> deleteLeaveByIdForStudent(@PathVariable Long leaveId,HttpServletRequest request) {
        try {
            Long user_id=(Long) request.getAttribute("user_id");
            String role = (String) request.getAttribute("role");
            if (!"STUDENT".equalsIgnoreCase(role) && !"ADMIN".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized: Only STUDENT or ADMIN can delete leaves");
            }
            leaveService.deleteLeaveOfSelf(leaveId,user_id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Leave deleted successfully");
            return ResponseEntity.ok(response);
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
            Long  userId = (Long) request.getAttribute("userId");
            if (!"PROJECT_MANAGER".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized: Only PROJECT_MANAGER can update leave status");
            }
            LeaveResponse updated = leaveService.updateLeaveStatus(leaveId,userId, newStatus);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }




    @GetMapping("/{leaveId}")
    public ResponseEntity<?> getLeaveById(@PathVariable Long leaveId,HttpServletRequest request) {
        try {
            String role = (String) request.getAttribute("role");
            Long userId = (Long) request.getAttribute("userId");

            if (!"STUDENT".equalsIgnoreCase(role) && !"PROJECT_MANAGER".equalsIgnoreCase(role) && !"HR".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized: Only STUDENT, PROJECT_MANAGER, or HR can view leave details");
            }
            LeaveResponse leave = leaveService.getLeaveById(leaveId);
            if ("PROJECT_MANAGER".equalsIgnoreCase(role) && leave!=null &&!leave.getReceiverID().equals(userId)){
                return errorResponse("Unauthorized: Only PROJECT_MANAGER can view requested leave details");
            }
            return ResponseEntity.ok(leave);
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
