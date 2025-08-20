package com.example.notification_service.service;

import com.example.notification_service.dto.NotificationRequest;
import com.example.notification_service.model.Notification;
import com.example.notification_service.model.NotificationRecipients;
import com.example.notification_service.model.RecipientRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NotificationService {
    Page<Notification> getNotificationsByRole(RecipientRole role, Pageable pageable);
    Notification createNotification(NotificationRequest dto);
    void deleteNotificationById(Long id);

    Notification markAsRead(Long id, RecipientRole role);
    List<NotificationRecipients>  markAllAsRead(RecipientRole role);
}
