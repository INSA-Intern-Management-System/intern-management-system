package com.example.leave_service.service;

import com.example.leave_service.dto.LeaveRequest;
import com.example.leave_service.dto.LeaveResponse;
import com.example.leave_service.model.Leave;
import com.example.leave_service.model.User;
import com.example.leave_service.repository.LeaveReposInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class LeaveService {

    private final LeaveReposInterface leaveRepository;

    @Autowired
    public LeaveService(LeaveReposInterface leaveRepository) {
        this.leaveRepository = leaveRepository;
    }

    // Create a leave
    public LeaveResponse createLeave(Long userId, LeaveRequest leaveRequest) {
        Leave leave = new Leave();
        leave.setLeaveType(leaveRequest.getLeaveType());
        leave.setFromDate(leaveRequest.getFromDate());
        leave.setToDate(leaveRequest.getToDate());
        leave.setReason(leaveRequest.getReason());
        leave.setLeaveStatus("PENDING");
        leave.setCreatedAt(new Date());

        User user = new User();
        user.setId(userId);
        leave.setUser(user);

        Leave savedLeave = leaveRepository.createLeave(leave);

        return mapToResponse(savedLeave);
    }

    // Get leaves with pagination
   public Page<LeaveResponse> getLeavesByUserId(Long userId, Pageable pageable) {
        Page<Leave> leavesPage = leaveRepository.findByUserId(userId, pageable);

        return leavesPage.map(this::convertToResponse);
    }

    private LeaveResponse convertToResponse(Leave leave) {
        return new LeaveResponse(
            leave.getLeaveId(),
            leave.getUser().getId(),
            leave.getLeaveType(),
            leave.getFromDate(),
            leave.getToDate(),
            leave.getReason(),
            leave.getLeaveStatus(),
            leave.getCreatedAt()
        );
    }

    // Get leave by ID
    public LeaveResponse getLeaveById(Long leaveId) {
        Leave leave = leaveRepository.getLeaveById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave not found with ID: " + leaveId));
        return mapToResponse(leave);
    }

    // Search leaves by type and/or reason
    public List<LeaveResponse> searchLeaves(String leaveType, String reason) {
        List<Leave> leaves = leaveRepository.searchLeaves(leaveType, reason);
        return leaves.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Filter leaves by type and status
    public List<LeaveResponse> filterLeavesByTypeAndStatus(String leaveType, String leaveStatus) {
        List<Leave> leaves = leaveRepository.filterLeavesByTypeAndStatus(leaveType, leaveStatus);
        return leaves.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Delete leave by ID
    public void deleteLeaveById(Long leaveId) {
        leaveRepository.deleteLeaveById(leaveId);
    }

    // Delete all leaves
    public void deleteAllLeaves() {
        leaveRepository.deleteAllLeaves();
    }

    // Get leave status counts
    public Map<String, Long> getLeaveStatusCounts() {
        return leaveRepository.getLeaveStatusCounts();
    }

    // Update leave status
    public LeaveResponse updateLeaveStatus(Long leaveId, String newStatus) {
        Leave updatedLeave = leaveRepository.updateLeaveStatus(leaveId, newStatus);
        return mapToResponse(updatedLeave);
    }

    // Helper: map Leave → LeaveResponse
    private LeaveResponse mapToResponse(Leave leave) {
        LeaveResponse response = new LeaveResponse();
        response.setLeaveId(leave.getLeaveId());
        response.setUserId(leave.getUser() != null ? leave.getUser().getId() : null);
        response.setLeaveType(leave.getLeaveType());
        response.setFromDate(leave.getFromDate());
        response.setToDate(leave.getToDate());
        response.setReason(leave.getReason());
        response.setLeaveStatus(leave.getLeaveStatus());
        response.setCreatedAt(leave.getCreatedAt());
        return response;
    }
}
