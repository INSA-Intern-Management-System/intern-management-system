package com.example.notification_service.service;

import com.example.notification_service.dto.NotificationRequest;
import com.example.notification_service.model.Notification;
import com.example.notification_service.model.RecipientRole;

import java.util.List;

public interface NotificationService {
    List<Notification> getNotificationsByRole(RecipientRole role);
    Notification createNotification(NotificationRequest dto);
    void deleteNotificationById(Long id);
}
