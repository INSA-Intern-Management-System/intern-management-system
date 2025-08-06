package com.example.schedule_service.repository;

import com.example.schedule_service.model.Schedule;
import com.example.schedule_service.model.ScheduleStatus;
import com.google.rpc.Status;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Date;
import java.util.HashMap;
import java.util.Optional;

public interface ScheduleRepositoryInterface {

    // Create a schedule
    Schedule createSchedule(Schedule schedule);

    // Get schedules by user with pagination
    Page<Schedule> findByUserId(Long userId, Pageable pageable);

    // Get schedule by ID
    Optional<Schedule> getScheduleById(Long scheduleId);

    // Search schedules by title or description
    Page<Schedule> searchSchedules(Long userId,String query , Pageable pageable);

    // Filter schedules by status (pending, completed, upcoming)
    Page<Schedule> filterSchedulesByStatus(Long userId,ScheduleStatus status, Pageable pageable);

    // Delete schedule by ID
    void deleteScheduleById(Long scheduleId);

    // Delete all schedules
    void deleteAllSchedules();

    //Delete all schedules by user ID
    void deleteAllSchedulesByUser_Id(Long userId);


    // Get schedule status counts (total, pending, completed, upcoming)
    HashMap<String, Long> getScheduleStatusCounts(Long userId);

    // Update schedule status
    Schedule updateScheduleStatus(Long userId,Long scheduleId, ScheduleStatus newStatus);

    // Find upcoming schedules before due date
    Page<Schedule> findUpcomingSchedules(Long userId,Date beforeDate, Pageable pageable);
    Page<Schedule> findByDueDateAfter(Long userId,Date date, Pageable pageable);
}
