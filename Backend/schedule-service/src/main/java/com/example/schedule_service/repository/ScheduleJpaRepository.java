package com.example.schedule_service.repository;

import com.example.schedule_service.model.Schedule;
import com.example.schedule_service.model.ScheduleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;

@Repository
public interface ScheduleJpaRepository extends JpaRepository<Schedule, Long> {

    // Search by title or description containing text, only for schedules of given user
    Page<Schedule> findByUser_IdAndTitleContainingIgnoreCaseOrUser_IdAndDescriptionContainingIgnoreCase(
        Long userId1, String title,
        Long userId2, String description,
        Pageable pageable
    );

    // Find all schedules of a user
    Page<Schedule> findByUser_Id(Long userId, Pageable pageable);

    // Find by status and user
    Page<Schedule> findByUser_IdAndStatus(Long userId, ScheduleStatus status, Pageable pageable);

    // Find by title containing text, for a specific user
    Page<Schedule> findByUser_IdAndTitleContainingIgnoreCase(Long userId, String title, Pageable pageable);

    // Find by description containing text, for a specific user
    Page<Schedule> findByUser_IdAndDescriptionContainingIgnoreCase(Long userId, String description, Pageable pageable);

    // Count by status and user
    Long countByUser_IdAndStatus(Long userId, ScheduleStatus status);

    // Count all schedules for a user
    Long countByUser_Id(Long userId);


    // Delete all schedules by user ID
    void deleteByUser_Id(Long userId);


    // Find by due date before, only for user's schedules
    Page<Schedule> findByUser_IdAndDueDateBefore(Long userId, Date date, Pageable pageable);

    // Find by due date after, only for user's schedules
    Page<Schedule> findByUser_IdAndDueDateAfter(Long userId, Date date, Pageable pageable);
}
