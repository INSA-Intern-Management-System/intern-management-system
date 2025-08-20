package com.example.notification_service.service;

import com.example.notification_service.controller.NotificationController;
import com.example.notification_service.dto.NotificationRequest;
import com.example.notification_service.model.Notification;
import com.example.notification_service.model.NotificationRecipients;
import com.example.notification_service.model.RecipientRole;
import com.example.notification_service.repository.NotificationRepository;
import com.example.notification_service.repository.RecipientRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class NotificationServiceImpl implements NotificationService {


    private final NotificationRepository notificationRepository;
    private final RecipientRepository recipientRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository,
                                   RecipientRepository recipientRepository) {
        this.notificationRepository = notificationRepository;
        this.recipientRepository = recipientRepository;
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
        notification.setType(dto.getNotificationType());
        notification.setRoles(dto.getRoles());

        // ✅ Create recipient entries for each role
        List<NotificationRecipients> recipients = dto.getRoles().stream()
                .map(role -> {
                    NotificationRecipients recipient = new NotificationRecipients();
                    recipient.setRole(role);
                    recipient.setRead(false); // default to unread
                    recipient.setNotification(notification);
                    return recipient;
                })
                .toList();

        notification.setRecipients(recipients);

        return notificationRepository.save(notification);
    }


    @Override
    public void deleteNotificationById(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notificationRepository.delete(notification);
    }

    @Override
    public Notification markAsRead(Long notificationId, RecipientRole role) {
        NotificationRecipients recipient = recipientRepository
                .findByNotificationIdAndRole(notificationId, role)
                .orElseThrow(() -> new RuntimeException("Recipient not found"));

        recipient.setRead(true);
        recipientRepository.save(recipient);

        // return the parent notification
        return recipient.getNotification();
    }

    @Override
    @Transactional
    public List<NotificationRecipients> markAllAsRead(RecipientRole role) {
        // Fetch all recipients of this role
        List<NotificationRecipients> recipients = recipientRepository.findByRole(role);

        // Mark all as read
        for (NotificationRecipients recipient : recipients) {
            recipient.setRead(true);
        }

        // Save back and return updated list
        return recipientRepository.saveAll(recipients);
    }


}
