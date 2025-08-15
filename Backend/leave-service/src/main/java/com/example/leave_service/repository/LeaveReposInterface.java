package com.example.leave_service.repository;

import com.example.leave_service.model.Leave;
import com.example.leave_service.model.LeaveStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.HashMap;
import java.util.Optional;

public interface LeaveReposInterface {

    // Create a leave
    Leave createLeave(Leave leave);

    // Get leaves with pagination
    Page<Leave> findByUserId(Long userId, Pageable pageable);

    // Get Leaves with pagination
    Page<Leave> findByReceiverId(Long receiverId, Pageable pageable);


    // Get leave by ID
    Optional<Leave> getLeaveById(Long leaveId);

    // Search leaves by type and/or reason
    Page<Leave> searchLeaves(String leaveType, String reason,Pageable pageable);
    Page<Leave> searchLeaves(Long userID,String leaveType, String reason,Pageable pageable);



    // Filter leaves by type and status
    Page<Leave> filterLeavesByTypeAndStatus(String leaveType, LeaveStatus  leaveStatus,Pageable pageable);


    Page<Leave> filterLeavesByTypeAndStatus(Long receiverId,String  leaveType, LeaveStatus leaveStatus,Pageable pageable);

    // Delete leave by ID
    void deleteLeaveById(Long leaveId, Long userId);

    // Delete all leaves with given userID
    void deleteAllLeaves(Long userID);

    // Get leave status counts (total, accepted, rejected, pending)
    HashMap<String, Long> getLeaveStatusCounts();

    // Get leave status counts (total, accepted, rejected, pending)
    HashMap<String, Long> getLeaveStatusCountsPm(Long receiverId);



    // Update leave status
    Leave updateLeaveStatus(Long leaveId, LeaveStatus newStatus);

    // Delete leave of self
    void deleteLeaveOfSelf(Long leaveId, Long userId);

    //Get all leaves 
    Page<Leave> getAllLeaves(Pageable pageable);
    
}
