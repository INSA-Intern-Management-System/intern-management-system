package com.example.leave_service.repository;

import com.example.leave_service.model.Leave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Repository
public interface LeaveJpaRepository extends JpaRepository<Leave, Long> {
    List<Leave> findByLeaveTypeContainingIgnoreCase(String leaveType);
    List<Leave> findByReasonContainingIgnoreCase(String reason);
    List<Leave> findByLeaveTypeAndLeaveStatus(String leaveType, String leaveStatus);
    Long countByLeaveStatus(String status);
    Page<Leave> findByUserId(Long userId, Pageable pageable);
}
