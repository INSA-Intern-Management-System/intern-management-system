package com.example.activity_service.repository;

import com.example.activity_service.model.Activity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivityJpaInterface extends JpaRepository<Activity, Long> {
    Page<Activity> findByUser_IdOrderByCreatedAtDesc(Long userId, Pageable pageable);
}
