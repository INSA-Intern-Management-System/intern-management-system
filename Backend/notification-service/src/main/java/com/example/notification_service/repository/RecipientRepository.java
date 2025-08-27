package com.example.notification_service.repository;

import com.example.notification_service.model.NotificationRecipients;
import com.example.notification_service.model.RecipientRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RecipientRepository extends JpaRepository<NotificationRecipients, Long> {
    Optional<NotificationRecipients> findByNotificationIdAndRole(Long id, RecipientRole role);
    List<NotificationRecipients> findByRole(RecipientRole role);

}
