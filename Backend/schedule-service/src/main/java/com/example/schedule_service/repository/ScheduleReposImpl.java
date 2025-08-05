package com.example.schedule_service.repository;

import com.example.schedule_service.model.Schedule;
import com.example.schedule_service.model.ScheduleStatus;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.HashMap;
import java.util.Optional;

@Repository
public class ScheduleReposImpl implements ScheduleRepositoryInterface {

    private final ScheduleJpaRepository scheduleJpaRepository;

    @Autowired
    public ScheduleReposImpl(ScheduleJpaRepository scheduleJpaRepository) {
        this.scheduleJpaRepository = scheduleJpaRepository;
    }

    @Override
    public Schedule createSchedule(Schedule schedule) {
        return scheduleJpaRepository.save(schedule);
    }

    @Override
    public Page<Schedule> findByUserId(Long userId, Pageable pageable) {
        return scheduleJpaRepository.findByUser_Id(userId, pageable);
    }

    @Override
    public Optional<Schedule> getScheduleById(Long scheduleId) {
        return scheduleJpaRepository.findById(scheduleId);
    }

  @Override
    public Page<Schedule> searchSchedules(Long userId, String query, Pageable pageable) {
        if (query != null && !query.trim().isEmpty()) {
            String trimmedQuery = query.trim();
            return scheduleJpaRepository.findByUser_IdAndTitleContainingIgnoreCaseOrUser_IdAndDescriptionContainingIgnoreCase(
                userId, trimmedQuery, userId, trimmedQuery, pageable
            );
        } else {
            return scheduleJpaRepository.findByUser_Id(userId, pageable);
        }
    }



    @Override
    public Page<Schedule> filterSchedulesByStatus(Long userId,ScheduleStatus status, Pageable pageable) {
        return scheduleJpaRepository.findByUser_IdAndStatus(userId,status,pageable);
    }

    @Override
    public void deleteScheduleById(Long scheduleId) {
        scheduleJpaRepository.deleteById(scheduleId);
    }

    @Override
    public void deleteAllSchedulesByUser_Id(Long userId) {
        scheduleJpaRepository.deleteByUser_Id(userId);
    }

    @Override
    public void deleteAllSchedules() {
        scheduleJpaRepository.deleteAll();
    }

    @Override
    public HashMap<String, Long> getScheduleStatusCounts(Long userId) {
        HashMap<String, Long> counts = new HashMap<>();
        counts.put("total", scheduleJpaRepository.countByUser_Id(userId));
        counts.put("pending", scheduleJpaRepository.countByUser_IdAndStatus(userId, ScheduleStatus.PENDING));
        counts.put("completed", scheduleJpaRepository.countByUser_IdAndStatus(userId, ScheduleStatus.COMPLETED));
        counts.put("upcoming", scheduleJpaRepository.countByUser_IdAndStatus(userId, ScheduleStatus.UPCOMING));
        return counts;
    }

    @Override
    public Schedule updateScheduleStatus(Long userId,Long scheduleId, ScheduleStatus newStatus) {
        Optional<Schedule> optionalSchedule = scheduleJpaRepository.findById(scheduleId);
        if (optionalSchedule.isPresent()) {
            Schedule schedule = optionalSchedule.get();
            schedule.setStatus(newStatus);
            return scheduleJpaRepository.save(schedule);
        } else {
            throw new RuntimeException("Schedule not found with ID: " + scheduleId);
        }
    }

    @Override
    public Page<Schedule> findUpcomingSchedules(Long user_id,Date beforeDate, Pageable pageable) {
        return scheduleJpaRepository.findByUser_IdAndDueDateBefore(user_id,beforeDate, pageable);
    }

    @Override
    public Page<Schedule> findByDueDateAfter(Long userId,Date date, Pageable pageable) {
        return scheduleJpaRepository.findByUser_IdAndDueDateAfter(userId,date, pageable);
    }
}
