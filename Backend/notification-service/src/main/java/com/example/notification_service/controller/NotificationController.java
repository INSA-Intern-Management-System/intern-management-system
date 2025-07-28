package com.example.notification_service.controller;


import com.example.notification_service.model.Notification;
import com.example.notification_service.model.RecipientRole;
import com.example.notification_service.repository.NotificationRepository;
import com.example.notification_service.service.NotificationService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping()
    public ResponseEntity<?> getMyNotifications(HttpServletRequest request) {
        String roleStr = (String) request.getAttribute("role");

        if (roleStr == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User role not found in request.");
        }

        RecipientRole role;
        try {
            role = RecipientRole.valueOf(roleStr);
            List<Notification> notifications = notificationService.getNotificationsByRole(role);
            return ResponseEntity.ok(notifications);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid role: " + roleStr);
        }

    }

}
