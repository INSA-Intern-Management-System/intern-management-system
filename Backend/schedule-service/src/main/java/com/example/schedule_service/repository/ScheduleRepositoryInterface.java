package com.example.schedule_service.repository;

import com.example.schedule_service.model.Schedule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;

public interface ScheduleRepositoryInterface {

    // Create a schedule
    Schedule createSchedule(Schedule schedule);

    // Get schedules by user with pagination
    Page<Schedule> findByUserId(Long userId, Pageable pageable);

    // Get schedule by ID
    Optional<Schedule> getScheduleById(Long scheduleId);

    // Search schedules by title or description
    List<Schedule> searchSchedules(String title, String description);

    // Filter schedules by status (pending, completed, upcoming)
    List<Schedule> filterSchedulesByStatus(String status);

    // Delete schedule by ID
    void deleteScheduleById(Long scheduleId);

    // Delete all schedules
    void deleteAllSchedules();

    // Get schedule status counts (total, pending, completed, upcoming)
    HashMap<String, Long> getScheduleStatusCounts();

    // Update schedule status
    Schedule updateScheduleStatus(Long scheduleId, String newStatus);

    // Find upcoming schedules before due date
    List<Schedule> findUpcomingSchedules(Date beforeDate);
    List<Schedule> findByDueDateAfter(Date date);
}
