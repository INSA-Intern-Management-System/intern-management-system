package com.example.leave_service.repository;

import com.example.leave_service.model.Leave;
import com.example.leave_service.model.LeaveStatus; // ✅ import the enum
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveJpaRepository extends JpaRepository<Leave, Long> {
    List<Leave> findByLeaveTypeContainingIgnoreCase(String leaveType);
    List<Leave> findByReasonContainingIgnoreCase(String reason);
    
    // ✅ Use LeaveStatus instead of String
    Page<Leave> findByLeaveTypeAndLeaveStatus(String leaveType, LeaveStatus leaveStatus, Pageable pageable);
    
    Long countByLeaveStatus(LeaveStatus status);
    
    Page<Leave> findByUserId(Long userId, Pageable pageable);
    Page<Leave> findByReceiver_Id(Long userId, Pageable pageable);
    long countByReceiver_Id(Long receiverId);
    long countByReceiver_IdAndLeaveStatus(Long receiverId, LeaveStatus leaveStatus); // ✅ fix here
    
    void deleteByUser_Id(Long userId);
    
    Page<Leave> findByReceiver_IdAndLeaveTypeAndLeaveStatus(Long receiverId, String leaveType, LeaveStatus leaveStatus, Pageable pageable); // ✅ fix here
    
    Page<Leave> findByLeaveTypeContainingIgnoreCaseAndReasonContainingIgnoreCase(String leaveType, String reason, Pageable pageable);
    Page<Leave> findByLeaveTypeContainingIgnoreCase(String leaveType, Pageable pageable);
    Page<Leave> findByReasonContainingIgnoreCase(String reason, Pageable pageable);
    Page<Leave> findByUser_IdAndLeaveTypeContainingIgnoreCaseAndReasonContainingIgnoreCase(Long userId, String leaveType, String reason, Pageable pageable);
    Page<Leave> findByUser_IdAndLeaveTypeContainingIgnoreCase(Long userId, String leaveType, Pageable pageable);
    Page<Leave> findByUser_IdAndReasonContainingIgnoreCase(Long userId, String reason, Pageable pageable);
    Page<Leave> findByUser_Id(Long userId, Pageable pageable);
}
