package com.example.notification_service.service;

import com.example.notification_service.controller.NotificationController;
import com.example.notification_service.dto.NotificationRequest;
import com.example.notification_service.model.Notification;
import com.example.notification_service.model.RecipientRole;
import com.example.notification_service.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class NotificationServiceImpl implements NotificationService {


    private final NotificationRepository notificationRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Override
    public List<Notification> getNotificationsByRole(RecipientRole role) {
        return notificationRepository.findByRolesContainingOrderByCreatedAtDesc(role);
    }

    @Override
    public Notification createNotification(NotificationRequest dto) {
        Notification notification = new Notification();

        notification.setTitle(dto.getTitle());
        notification.setDescription(dto.getDescription());
        notification.setRoles(dto.getRoles());
        notification.setRead(dto.getIs_read());
        notification.setType(dto.getNotificationType());

        return notificationRepository.save(notification);

    }
    
    @Override
    public void deleteNotificationById(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notificationRepository.delete(notification);
    }
}
