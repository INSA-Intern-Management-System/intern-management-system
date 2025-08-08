package com.example.leave_service.repository;

import com.example.leave_service.model.Leave;
import com.example.leave_service.model.LeaveStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.Optional;

@Repository
public class LeaveReposImp implements LeaveReposInterface {

    private final LeaveJpaRepository leaveJpaRepository;

    @Autowired
    public LeaveReposImp(LeaveJpaRepository leaveJpaRepository) {
        this.leaveJpaRepository = leaveJpaRepository;
    }

    @Override
    public Leave createLeave(Leave leave) {
        return leaveJpaRepository.save(leave);
    }

    @Override
    public Page<Leave> findByUserId(Long userId, Pageable pageable) {
        return leaveJpaRepository.findByUserId(userId, pageable);
    }

    @Override
    public Optional<Leave> getLeaveById(Long leaveId) {
        return leaveJpaRepository.findById(leaveId);
    }

    @Override
    public Page<Leave> searchLeaves(String leaveType, String reason, Pageable pageable) {
        if (leaveType != null && !leaveType.isEmpty() && reason != null && !reason.isEmpty()) {
            return leaveJpaRepository.findByLeaveTypeContainingIgnoreCaseAndReasonContainingIgnoreCase(
                    leaveType, reason, pageable);
        } else if (leaveType != null && !leaveType.isEmpty()) {
            return leaveJpaRepository.findByLeaveTypeContainingIgnoreCase(leaveType, pageable);
        } else if (reason != null && !reason.isEmpty()) {
            return leaveJpaRepository.findByReasonContainingIgnoreCase(reason, pageable);
        } else {
            return leaveJpaRepository.findAll(pageable);
        }
    }

    @Override
    public Page<Leave> searchLeaves(Long userId, String leaveType, String reason, Pageable pageable) {
        if (leaveType != null && !leaveType.isEmpty() && reason != null && !reason.isEmpty()) {
            return leaveJpaRepository.findByUser_IdAndLeaveTypeContainingIgnoreCaseAndReasonContainingIgnoreCase(
                    userId, leaveType, reason, pageable);
        } else if (leaveType != null && !leaveType.isEmpty()) {
            return leaveJpaRepository.findByUser_IdAndLeaveTypeContainingIgnoreCase(userId, leaveType, pageable);
        } else if (reason != null && !reason.isEmpty()) {
            return leaveJpaRepository.findByUser_IdAndReasonContainingIgnoreCase(userId, reason, pageable);
        } else {
            return leaveJpaRepository.findByUser_Id(userId, pageable);
        }
    }

    @Override
    public Page<Leave> filterLeavesByTypeAndStatus(String leaveType, LeaveStatus leaveStatus, Pageable pageable) {
        return leaveJpaRepository.findByLeaveTypeAndLeaveStatus(leaveType, leaveStatus, pageable);
    }

    @Override
    public Page<Leave> filterLeavesByTypeAndStatus(Long receiverId, String leaveType, LeaveStatus leaveStatus, Pageable pageable) {
        return leaveJpaRepository.findByReceiver_IdAndLeaveTypeAndLeaveStatus(receiverId, leaveType, leaveStatus, pageable);
    }

    @Override
    public void deleteLeaveById(Long leaveId, Long userId) {
        Optional<Leave> leaveOpt = leaveJpaRepository.findById(leaveId);
        if (leaveOpt.isPresent()) {
            Leave leave = leaveOpt.get();
            if (leave.getUser() != null && leave.getUser().getId().equals(userId)) {
                leaveJpaRepository.deleteById(leaveId);
            } else {
                throw new RuntimeException("Unauthorized: You can only delete your own leaves");
            }
        } else {
            throw new RuntimeException("Leave not found with ID: " + leaveId);
        }
    }

    @Override
    public void deleteAllLeaves(Long userID) {
        leaveJpaRepository.deleteByUser_Id(userID);
    }

    @Override
    public HashMap<String, Long> getLeaveStatusCounts() {
        HashMap<String, Long> counts = new HashMap<>();
        counts.put("total", leaveJpaRepository.count());
        counts.put("approved", leaveJpaRepository.countByLeaveStatus(LeaveStatus.APPROVED));
        counts.put("rejected", leaveJpaRepository.countByLeaveStatus(LeaveStatus.REJECTED));
        counts.put("pending", leaveJpaRepository.countByLeaveStatus(LeaveStatus.PENDING));
        return counts;
    }

    @Override
    public HashMap<String, Long> getLeaveStatusCountsPm(Long receiverId) {
        HashMap<String, Long> counts = new HashMap<>();
        counts.put("total", leaveJpaRepository.countByReceiver_Id(receiverId));
        counts.put("approved", leaveJpaRepository.countByReceiver_IdAndLeaveStatus(receiverId, LeaveStatus.APPROVED));
        counts.put("rejected", leaveJpaRepository.countByReceiver_IdAndLeaveStatus(receiverId, LeaveStatus.REJECTED));
        counts.put("pending", leaveJpaRepository.countByReceiver_IdAndLeaveStatus(receiverId, LeaveStatus.PENDING));
        return counts;
    }

    @Override
    public Leave updateLeaveStatus(Long leaveId, LeaveStatus newStatus) {
        Optional<Leave> leaveOpt = leaveJpaRepository.findById(leaveId);
        if (leaveOpt.isPresent()) {
            Leave leave = leaveOpt.get();
            leave.setLeaveStatus(newStatus);
            return leaveJpaRepository.save(leave);
        } else {
            throw new RuntimeException("Leave not found with ID: " + leaveId);
        }
    }

    @Override
    public void deleteLeaveOfSelf(Long leaveId, Long userId) {
        Optional<Leave> leaveOpt = leaveJpaRepository.findById(leaveId);
        if (leaveOpt.isPresent()) {
            Leave leave = leaveOpt.get();
            if (leave.getUser() != null && leave.getUser().getId().equals(userId)) {
                leaveJpaRepository.delete(leave);
            } else {
                throw new RuntimeException("Unauthorized: You can only delete your own leaves");
            }
        } else {
            throw new RuntimeException("Leave not found with ID: " + leaveId);
        }
    }

    @Override
    public Page<Leave> findByReceiverId(Long receiverId, Pageable pageable) {
        return leaveJpaRepository.findByReceiver_Id(receiverId, pageable);
    }

    @Override
    public Page<Leave> getAllLeaves(Pageable pageable) {
        return leaveJpaRepository.findAll(pageable);
    }
}
