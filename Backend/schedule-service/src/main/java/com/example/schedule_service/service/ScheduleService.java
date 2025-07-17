package com.example.schedule_service.service;

import com.example.schedule_service.dto.ScheduleRequest;
import com.example.schedule_service.dto.ScheduleResponse;
import com.example.schedule_service.model.Schedule;
import com.example.schedule_service.repository.ScheduleRepositoryInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ScheduleService {

    private final ScheduleRepositoryInterface scheduleRepository;

    @Autowired
    public ScheduleService(ScheduleRepositoryInterface scheduleRepository) {
        this.scheduleRepository = scheduleRepository;
    }

    // Create a schedule
    public ScheduleResponse createSchedule(Long userId, ScheduleRequest request) {
        Schedule schedule = new Schedule();
        schedule.setTitle(request.getTitle());
        schedule.setDescription(request.getDescription());
        schedule.setDueDate(request.getDueDate());
        schedule.setStatus("pending"); // default
        schedule.setCreatedAt(new Date());
        schedule.setUserId(userId);

        Schedule savedSchedule = scheduleRepository.createSchedule(schedule);
        return mapToResponse(savedSchedule);
    }

    // Get schedules with pagination by userId
    public Page<ScheduleResponse> getSchedulesByUserId(Long userId, Pageable pageable) {
        Page<Schedule> schedulesPage = scheduleRepository.findByUserId(userId, pageable);
        return schedulesPage.map(this::convertToResponse);
    }

    private ScheduleResponse convertToResponse(Schedule schedule) {
        return new ScheduleResponse(
            schedule.getScheduleId(),
            schedule.getUserId() != null ? schedule.getUserId() : null,
            schedule.getTitle(),
            schedule.getDescription(),
            schedule.getDueDate(),
            schedule.getStatus(),
            schedule.getCreatedAt()
        );
    }

    // Get schedule by ID
    public ScheduleResponse getScheduleById(Long scheduleId) {
        Schedule schedule = scheduleRepository.getScheduleById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule not found with ID: " + scheduleId));
        return mapToResponse(schedule);
    }

    // Search schedules by title or description
    public List<ScheduleResponse> searchSchedules(String title, String description) {
        List<Schedule> schedules = scheduleRepository.searchSchedules(title, description);
        return schedules.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Filter schedules by status
    public List<ScheduleResponse> filterSchedulesByStatus(String status) {
        List<Schedule> schedules = scheduleRepository.filterSchedulesByStatus(status);
        return schedules.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Delete schedule by ID
    public void deleteScheduleById(Long scheduleId) {
        scheduleRepository.deleteScheduleById(scheduleId);
    }

    // Delete all schedules
    public void deleteAllSchedules() {
        scheduleRepository.deleteAllSchedules();
    }

    // Get schedule status counts
    public Map<String, Long> getScheduleStatusCounts() {
        return scheduleRepository.getScheduleStatusCounts();
    }

    // Update schedule status
    public ScheduleResponse updateScheduleStatus(Long scheduleId, String newStatus) {
        Schedule updated = scheduleRepository.updateScheduleStatus(scheduleId, newStatus);
        return mapToResponse(updated);
    }

    // Find upcoming schedules before date
    public List<ScheduleResponse> findUpcomingSchedules(Date beforeDate) {
        List<Schedule> schedules = scheduleRepository.findUpcomingSchedules(beforeDate);
        return schedules.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Find schedules with due date after a given date
    public List<ScheduleResponse> findSchedulesByDueDateAfter(Date date) {
        List<Schedule> schedules = scheduleRepository.findByDueDateAfter(date);
        return schedules.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    // Helper: map Schedule → ScheduleResponse
    private ScheduleResponse mapToResponse(Schedule schedule) {
        ScheduleResponse response = new ScheduleResponse();
        response.setScheduleId(schedule.getScheduleId());
        response.setUserId(schedule.getUserId() != null ? schedule.getUserId() : null);
        response.setTitle(schedule.getTitle());
        response.setDescription(schedule.getDescription());
        response.setDueDate(schedule.getDueDate());
        response.setStatus(schedule.getStatus());
        response.setCreatedAt(schedule.getCreatedAt());
        return response;
    }
}
