package com.example.leave_service.repository;

import com.example.leave_service.model.Leave;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.List;
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
    public List<Leave> searchLeaves(String leaveType, String reason) {
        if (leaveType != null && !leaveType.isEmpty() && reason != null && !reason.isEmpty()) {
            // filter by both type and reason
            return leaveJpaRepository.findAll().stream()
                    .filter(l -> l.getLeaveType().toLowerCase().contains(leaveType.toLowerCase()))
                    .filter(l -> l.getReason().toLowerCase().contains(reason.toLowerCase()))
                    .toList();
        } else if (leaveType != null && !leaveType.isEmpty()) {
            return leaveJpaRepository.findByLeaveTypeContainingIgnoreCase(leaveType);
        } else if (reason != null && !reason.isEmpty()) {
            return leaveJpaRepository.findByReasonContainingIgnoreCase(reason);
        } else {
            return leaveJpaRepository.findAll();
        }
    }

    @Override
    public List<Leave> filterLeavesByTypeAndStatus(String leaveType, String leaveStatus) {
        return leaveJpaRepository.findByLeaveTypeAndLeaveStatus(leaveType, leaveStatus);
    }

    @Override
    public void deleteLeaveById(Long leaveId) {
        leaveJpaRepository.deleteById(leaveId);
    }

    @Override
    public void deleteAllLeaves() {
        leaveJpaRepository.deleteAll();
    }

    @Override
    public HashMap<String, Long> getLeaveStatusCounts() {
        HashMap<String, Long> counts = new HashMap<>();
        counts.put("total", leaveJpaRepository.count());
        counts.put("accepted", leaveJpaRepository.countByLeaveStatus("ACCEPTED"));
        counts.put("rejected", leaveJpaRepository.countByLeaveStatus("REJECTED"));
        counts.put("pending", leaveJpaRepository.countByLeaveStatus("PENDING"));
        return counts;
    }

    @Override
    public Leave updateLeaveStatus(Long leaveId, String newStatus) {
        Optional<Leave> leaveOpt = leaveJpaRepository.findById(leaveId);
        if (leaveOpt.isPresent()) {
            Leave leave = leaveOpt.get();
            leave.setLeaveStatus(newStatus);
            return leaveJpaRepository.save(leave);
        } else {
            throw new RuntimeException("Leave not found with ID: " + leaveId);
        }
    }
}
