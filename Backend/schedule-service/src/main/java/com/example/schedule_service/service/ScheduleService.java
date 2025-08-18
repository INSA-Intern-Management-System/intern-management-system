package com.example.schedule_service.service;

import com.example.project_service.gRPC.AllMilestones;
import com.example.schedule_service.client.ActivityGrpcClient;
import com.example.schedule_service.client.InternManagerGrpcClient;
import com.example.schedule_service.client.ProjectManagerGrpcClient;
import com.example.schedule_service.dto.MilestoneResponse;
import com.example.schedule_service.dto.ScheduleRequest;
import com.example.schedule_service.dto.ScheduleResponse;
import com.example.schedule_service.model.Schedule;
import com.example.schedule_service.model.ScheduleStatus;
import com.example.schedule_service.model.User;
import com.example.schedule_service.repository.ScheduleRepositoryInterface;
import com.example.userservice.gRPC.InternManagerResponse;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

@Service
public class ScheduleService {

    private final ScheduleRepositoryInterface scheduleRepository;
    private final ActivityGrpcClient activityGrpcClient;
    private final ProjectManagerGrpcClient projectManagerGrpcClient;
    private final InternManagerGrpcClient  internManagerGrpcClient;

    @Autowired
    public ScheduleService(ScheduleRepositoryInterface scheduleRepository,
                           ActivityGrpcClient activityGrpcClient,
                           ProjectManagerGrpcClient projectManagerGrpcClient,
                           InternManagerGrpcClient internManagerGrpcclient) {
        this.scheduleRepository = scheduleRepository;
        this.activityGrpcClient = activityGrpcClient;
        this.projectManagerGrpcClient=projectManagerGrpcClient;
        this.internManagerGrpcClient=internManagerGrpcclient;
    }

    // Create a schedule
    @Transactional
    public ScheduleResponse createSchedule(String jwtToken, Long userId, ScheduleRequest request) {
        Schedule schedule = new Schedule();
        schedule.setTitle(request.getTitle());
        schedule.setDescription(request.getDescription());
        schedule.setDueDate(request.getDueDate());
        schedule.setStatus(ScheduleStatus.PENDING); // default
        schedule.setCreatedAt(new Date());
        schedule.setUser(new User(userId));

        Schedule savedSchedule = scheduleRepository.createSchedule(schedule);
        // Log activity
        logActivity(jwtToken, userId, "Create Schedule", "Created schedule with title: " + request.getTitle());
        return mapToResponse(savedSchedule);
    }

    // Get schedules with pagination by userId
    @Transactional
    public HashMap<String,Object> getSchedulesByUserId(String jwtToken,Long userId, Pageable pageable) {
        Page<Schedule> schedulesPage = scheduleRepository.findByUserId(userId, pageable);
        InternManagerResponse internDTO = internManagerGrpcClient.getInternManagerByUserId(jwtToken, userId);
        List<MilestoneResponse> milestoneDTOs = new ArrayList<>();
        if (internDTO != null && internDTO.getProjectId() != 0) {
            AllMilestones activeMilestones = projectManagerGrpcClient
                    .getActiveMilestones(jwtToken, internDTO.getProjectId());

            if (activeMilestones != null) {
                milestoneDTOs = activeMilestones.getMilestonesList().stream()
                        .map(m -> new MilestoneResponse(
                                m.getMilestoneId(),
                                m.getMilestoneTitle(),
                                m.getMilestoneDescription(),
                                m.getMilestoneStatus(),
                                m.hasMilestoneDueDate()
                                        ? LocalDateTime.ofInstant(
                                        Instant.ofEpochSecond(
                                                m.getMilestoneDueDate().getSeconds(),
                                                m.getMilestoneDueDate().getNanos()
                                        ),
                                        ZoneId.systemDefault()
                                )
                                        : null,
                                m.hasMilestoneCreatedAt()
                                        ? LocalDateTime.ofInstant(
                                        Instant.ofEpochSecond(
                                                m.getMilestoneCreatedAt().getSeconds(),
                                                m.getMilestoneCreatedAt().getNanos()
                                        ),
                                        ZoneId.systemDefault()
                                )
                                        : null
                        ))
                        .toList();
                    }
                }
        HashMap<String,Object> result=new HashMap<>();
        result.put("milestones", milestoneDTOs);
        result.put("tasks", schedulesPage.map(this::convertToResponse));
        return result;
    }

    private ScheduleResponse convertToResponse(Schedule schedule) {
        return new ScheduleResponse(
            schedule.getScheduleId(),
            schedule.getUser() != null ? schedule.getUser().getUserId() : null,
            schedule.getTitle(),
            schedule.getDescription(),
            schedule.getDueDate(),
            schedule.getStatus(),
            schedule.getCreatedAt()
        );
    }

    // Get schedule by ID
    public ScheduleResponse getScheduleById(Long userId,Long scheduleId) {
        Schedule schedule = scheduleRepository.getScheduleById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule not found with ID: " + scheduleId));

        // Check if the userId matches the schedule's userId
        if (!schedule.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized: User ID does not match the schedule's user ID");
        }
        return mapToResponse(schedule);
    }

    // Search schedules by title or description
    public Page<ScheduleResponse> searchSchedules(Long userId,String query, Pageable pageable) {
        Page<Schedule> schedules = scheduleRepository.searchSchedules(userId,query, pageable);
        return schedules.map(this::mapToResponse);
    }

    // Filter schedules by status
    public Page<ScheduleResponse> filterSchedulesByStatus(Long userId,ScheduleStatus status, Pageable pageable) {
        Page<Schedule> schedules = scheduleRepository.filterSchedulesByStatus(userId,status, pageable);
        return schedules.map(this::mapToResponse);
        
    }

    // Delete schedule by ID
    @Transactional
    public void deleteScheduleById(String jwtToken, Long userId,Long scheduleId) {
        //check if the schedule exists
        Optional<Schedule> optionalSchedule = scheduleRepository.getScheduleById(scheduleId);
        if (!optionalSchedule.isPresent()) {
            throw new RuntimeException("Schedule not found with ID: " + scheduleId);
        }
        //check if the userId matches the schedule's userId
        if (!optionalSchedule.get().getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized: User ID does not match the schedule's user ID");
        }

        scheduleRepository.deleteScheduleById(scheduleId);
        // Log activity
        logActivity(jwtToken, userId, "Delete Schedule", "Deleted schedule with Title: " + optionalSchedule.get().getTitle());
    }

    // Delete all schedules
    @Transactional
    public void deleteAllSchedules(String jwtToken, Long userId) {
        scheduleRepository.deleteAllSchedulesByUser_Id(userId);
        // Log activity
        logActivity(jwtToken, userId, "Delete All Schedules", "Deleted all schedules of your schedule");
    }

    // Get schedule status counts
    public Map<String, Long> getScheduleStatusCounts(Long userId) {
        return scheduleRepository.getScheduleStatusCounts(userId);
    }

    // Update schedule status
    @Transactional
    public ScheduleResponse updateScheduleStatus(String jwtToken,Long userId,Long scheduleId, ScheduleStatus newStatus) {
        Schedule updated = scheduleRepository.updateScheduleStatus(userId,scheduleId, newStatus);
        if (updated == null) {
            throw new RuntimeException("Schedule not found with ID: " + scheduleId);
        }
        // Log activity
        logActivity(jwtToken, userId, "Update Schedule Status", "Updated schedule status with title: " + updated.getTitle() + " from " + updated.getStatus() + " to " + newStatus);
        return mapToResponse(updated);
    }

    // Find upcoming schedules before date
    public Page<ScheduleResponse> findUpcomingSchedules(Long userId,Date beforeDate, Pageable pageable) {
        Page<Schedule> schedules = scheduleRepository.findUpcomingSchedules(userId,beforeDate, pageable);
        return schedules.map(this::mapToResponse);
    }

    // Find schedules with due date after a given date
    public Page<ScheduleResponse> findSchedulesByDueDateAfter(Long userId,Date date, Pageable pageable) {
        Page<Schedule> schedules = scheduleRepository.findByDueDateAfter(userId,date, pageable);
        return schedules.map(this::mapToResponse);
    }
    // Helper: map Schedule → ScheduleResponse
    private ScheduleResponse mapToResponse(Schedule schedule) {
        ScheduleResponse response = new ScheduleResponse();
        response.setScheduleId(schedule.getScheduleId());
        response.setUserId(schedule.getUser().getUserId() != null ? schedule.getUser().getUserId() : null);
        response.setTitle(schedule.getTitle());
        response.setDescription(schedule.getDescription());
        response.setDueDate(schedule.getDueDate());
        response.setStatus(schedule.getStatus());
        response.setCreatedAt(schedule.getCreatedAt());
        return response;
    }

    private void logActivity(String jwtToken, Long userId, String action, String description) {
        try {
            activityGrpcClient.createActivity(jwtToken, userId, action, description);
        } catch (Exception e) {
            // Log the failure, but do NOT block business logic
            System.err.println("Failed to log activity: " + e.getMessage());
        }
    }
}
