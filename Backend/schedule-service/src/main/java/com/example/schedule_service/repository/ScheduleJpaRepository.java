package com.example.schedule_service.repository;

import com.example.schedule_service.model.Schedule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface ScheduleJpaRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByTitleContainingIgnoreCase(String title);
    List<Schedule> findByDescriptionContainingIgnoreCase(String description);
    List<Schedule> findByStatus(String status);
    Long countByStatus(String status);
    Page<Schedule> findByUserId(Long userId, Pageable pageable);
    List<Schedule> findByDueDateBefore(Date date);
    List<Schedule> findByDueDateAfter(Date date);
}
