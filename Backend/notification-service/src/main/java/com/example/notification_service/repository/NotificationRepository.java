package com.example.notification_service.repository;

import com.example.notification_service.model.Notification;
import com.example.notification_service.model.RecipientRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByRolesContainingOrderByCreatedAtDesc(RecipientRole role, Pageable pageable);

    List<Notification> findByRolesContaining(RecipientRole role);
}
