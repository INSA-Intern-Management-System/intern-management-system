package com.example.schedule_service.repository;

import com.example.schedule_service.model.Schedule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
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
        return scheduleJpaRepository.findByUserId(userId, pageable);
    }

    @Override
    public Optional<Schedule> getScheduleById(Long scheduleId) {
        return scheduleJpaRepository.findById(scheduleId);
    }

    @Override
    public List<Schedule> searchSchedules(String title, String description) {
        if (title != null && !title.isEmpty() && description != null && !description.isEmpty()) {
            // search by both title and description
            return scheduleJpaRepository.findAll().stream()
                    .filter(s -> s.getTitle().toLowerCase().contains(title.toLowerCase()))
                    .filter(s -> s.getDescription().toLowerCase().contains(description.toLowerCase()))
                    .toList();
        } else if (title != null && !title.isEmpty()) {
            return scheduleJpaRepository.findByTitleContainingIgnoreCase(title);
        } else if (description != null && !description.isEmpty()) {
            return scheduleJpaRepository.findByDescriptionContainingIgnoreCase(description);
        } else {
            return scheduleJpaRepository.findAll();
        }
    }

    @Override
    public List<Schedule> filterSchedulesByStatus(String status) {
        return scheduleJpaRepository.findByStatus(status);
    }

    @Override
    public void deleteScheduleById(Long scheduleId) {
        scheduleJpaRepository.deleteById(scheduleId);
    }

    @Override
    public void deleteAllSchedules() {
        scheduleJpaRepository.deleteAll();
    }

    @Override
    public HashMap<String, Long> getScheduleStatusCounts() {
        HashMap<String, Long> counts = new HashMap<>();
        counts.put("total", scheduleJpaRepository.count());
        counts.put("pending", scheduleJpaRepository.countByStatus("pending"));
        counts.put("completed", scheduleJpaRepository.countByStatus("completed"));
        counts.put("upcoming", scheduleJpaRepository.countByStatus("upcoming"));
        return counts;
    }

    @Override
    public Schedule updateScheduleStatus(Long scheduleId, String newStatus) {
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
    public List<Schedule> findUpcomingSchedules(Date beforeDate) {
        return scheduleJpaRepository.findByDueDateBefore(beforeDate);
    }

    @Override
    public List<Schedule> findByDueDateAfter(Date date) {
        return scheduleJpaRepository.findByDueDateAfter(date);
    }
}
