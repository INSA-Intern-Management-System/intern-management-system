package com.example.activity_service.repository;

import com.example.activity_service.model.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Integer> {

    // Custom query to find recent activities
    List<Activity> findTopNByOrderByCreatedAtDesc(Long n);

    // Find activities by user (optional)
    List<Activity> findByUserIdOrderByCreatedAtDesc(Long userId);
}