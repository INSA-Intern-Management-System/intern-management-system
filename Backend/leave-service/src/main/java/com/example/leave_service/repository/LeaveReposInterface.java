package com.example.leave_service.repository;

import com.example.leave_service.model.Leave;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.HashMap;
import java.util.List;
import java.util.Optional;

public interface LeaveReposInterface {

    // Create a leave
    Leave createLeave(Leave leave);

    // Get leaves with pagination
    Page<Leave> findByUserId(Long userId, Pageable pageable);

    // Get leave by ID
    Optional<Leave> getLeaveById(Long leaveId);

    // Search leaves by type and/or reason
    List<Leave> searchLeaves(String leaveType, String reason);

    // Filter leaves by type and status
    List<Leave> filterLeavesByTypeAndStatus(String leaveType, String leaveStatus);

    // Delete leave by ID
    void deleteLeaveById(Long leaveId);

    // Delete all leaves
    void deleteAllLeaves();

    // Get leave status counts (total, accepted, rejected, pending)
    HashMap<String, Long> getLeaveStatusCounts();

    // Update leave status
    Leave updateLeaveStatus(Long leaveId, String newStatus);
}
