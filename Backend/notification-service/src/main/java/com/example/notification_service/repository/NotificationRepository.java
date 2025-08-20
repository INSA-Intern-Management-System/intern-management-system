package com.example.notification_service.repository;

import com.example.notification_service.model.Notification;
import com.example.notification_service.model.RecipientRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRolesContainingOrderByCreatedAtDesc(RecipientRole role);

    List<Notification> findByRolesContaining(RecipientRole role);
}
