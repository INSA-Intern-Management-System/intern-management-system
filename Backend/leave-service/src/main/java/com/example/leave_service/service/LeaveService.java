package com.example.leave_service.service;

import com.example.leave_service.client.ActivityGrpcClient;
import com.example.leave_service.dto.LeaveRequest;
import com.example.leave_service.dto.LeaveResponse;
import com.example.leave_service.model.Leave;
import com.example.leave_service.model.LeaveStatus;
import com.example.leave_service.model.User;
import com.example.leave_service.repository.InternManagerReposInterface;
import com.example.leave_service.repository.LeaveReposInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class LeaveService {

    private final LeaveReposInterface leaveRepository;
    private final InternManagerReposInterface internManagerRepos;
    private final ActivityGrpcClient activityGrpcClient;


    @Autowired
    public LeaveService(LeaveReposInterface leaveRepository,
                        InternManagerReposInterface internManagerRepos,
                        ActivityGrpcClient activityGrpcClient) {
        this.leaveRepository = leaveRepository;
        this.internManagerRepos = internManagerRepos;
        this.activityGrpcClient = activityGrpcClient;
    }

    // Create a leave
  
    @Transactional
    public LeaveResponse createLeave(String jwtToken,Long userId, LeaveRequest leaveRequest) {
        // Create Leave object
        Leave leave = new Leave();
        leave.setLeaveType(leaveRequest.getLeaveType());
        leave.setFromDate(leaveRequest.getFromDate());
        leave.setToDate(leaveRequest.getToDate());
        leave.setReason(leaveRequest.getReason());
        leave.setLeaveStatus(LeaveStatus.PENDING);
        leave.setCreatedAt(new Date());
        User user = new User();
        user.setId(userId);
        leave.setUser(user);

        //Get manager id by user id
        Long managerId = internManagerRepos.getManagerIdByUserId(userId);
        if (managerId != null) {
            User manager = new User();
            manager.setId(managerId);
            leave.setReceiver(manager);
        } else {
            // Optionally handle case when manager not found
            System.err.println("Manager not found for user with id: " + userId);
            throw new RuntimeException("Manager not found for user with id: " + userId);
        }

        Leave savedLeave = leaveRepository.createLeave(leave);
        // Log activity
        logActivity(jwtToken, userId, "Create Leave", "Leave created with ID: " + savedLeave.getLeaveId()+", Type: " + savedLeave.getLeaveType());
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
            leave.getReceiver().getId(),
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
    public Page<LeaveResponse> searchLeaves(String leaveType, String reason, Pageable pageable) {
        Page<Leave> leavesPage = leaveRepository.searchLeaves(leaveType, reason, pageable);
        return leavesPage.map(this::mapToResponse);
    }

    public Page<LeaveResponse> searchLeaves(Long userID,String leaveType, String reason,Pageable pageable) {
        Page<Leave> leavesPage = leaveRepository.searchLeaves(userID,leaveType, reason, pageable);
        return leavesPage.map(this::mapToResponse);
    }

    // Filter leaves by type and status
    public Page<LeaveResponse> filterLeavesByTypeAndStatus(String leaveType, LeaveStatus leaveStatus, Pageable pageable) {
        Page<Leave> leavesPage = leaveRepository.filterLeavesByTypeAndStatus(leaveType, leaveStatus, pageable);
        Page<LeaveResponse> responsePage = leavesPage.map(this::mapToResponse);

        return responsePage;
    }

    public Page<LeaveResponse> filterLeavesByTypeAndStatus(Long receiverId, String leaveType, LeaveStatus leaveStatus, Pageable pageable) {

        Page<Leave> leavesPage = leaveRepository.filterLeavesByTypeAndStatus(receiverId, leaveType, leaveStatus, pageable);
        Page<LeaveResponse> responsePage = leavesPage.map(this::mapToResponse);

        return responsePage;
    }



    // Delete leave by ID
    public void deleteLeaveById(Long leaveId, Long userId) {
        leaveRepository.deleteLeaveById(leaveId,userId);
    }

    // Delete all leaves
    @Transactional
    public void deleteAllLeaves(Long userId) {
        leaveRepository.deleteAllLeaves(userId);
    }

    // Get leave status counts
    public Map<String, Long> getLeaveStatusCounts() {
        return leaveRepository.getLeaveStatusCounts();
    }
    // get leave status counts for student 
    public Map<String, Long> getLeaveStatusCountsForStudent(Long userId) {
        return leaveRepository.getLeaveStatusCounts(userId);
    }


    //get status count for pm
    public Map<String, Long> getLeaveStatusCounts(Long receiverId) {
        return leaveRepository.getLeaveStatusCountsPm(receiverId);
    }


    // Update leave status
    @Transactional
    public LeaveResponse updateLeaveStatus(String jwtToken,Long leaveId,long receiver_id, LeaveStatus newStatus) {
        //Get by using leave id
        Optional<Leave> leave = leaveRepository.getLeaveById(leaveId);
        if (leave.isEmpty()) {
            throw new RuntimeException("Leave not found with ID: " + leaveId);
        }

        //check if it correct reciver id
        if (!leave.get().getReceiver().getId().equals(receiver_id)) {
            throw new RuntimeException("Unauthorized: You can only update your own leaves");
        }

        Leave updatedLeave = leaveRepository.updateLeaveStatus(leaveId, newStatus);
        // Log activity
        logActivity(jwtToken, receiver_id, "Update Leave Status", "Leave ID: " + leaveId + ", New Status: " + newStatus);
        return mapToResponse(updatedLeave);
    }
    // Delete leave of self
    public void deleteLeaveOfSelf(String jwtToken, Long leaveId, Long userId) {
        leaveRepository.deleteLeaveOfSelf(leaveId, userId);
        // Log activity
        logActivity(jwtToken, userId, "Delete Leave", "Leave deleted with ID: " + leaveId);
    }

    //get leaves by recevier id 
    public Page<LeaveResponse> getLeavesByManager(Long userId, Pageable pageable) {
        Page<Leave> leavesPage = leaveRepository.findByReceiverId(userId, pageable);
        return leavesPage.map(this::mapToResponse);
    }

    //get all leaves
    public Page<LeaveResponse> getAllLeaves(Pageable pageable) {
        Page<Leave> leavesPage = leaveRepository.getAllLeaves(pageable);
        return leavesPage.map(this::mapToResponse);
    }

    

    private void logActivity(String jwtToken, Long userId, String action, String description) {
        try {
            activityGrpcClient.createActivity(jwtToken, userId, action, description);
        } catch (Exception e) {
            // Log the failure, but do NOT block business logic
            System.err.println("Failed to log activity: " + e.getMessage());
        }
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
        response.setReceiverID(leave.getReceiver().getId());
        response.setCreatedAt(leave.getCreatedAt());
        return response;
    }
}
