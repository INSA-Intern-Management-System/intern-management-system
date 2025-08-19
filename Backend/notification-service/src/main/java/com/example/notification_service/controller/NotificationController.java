
package com.example.notification_service.controller;


import com.example.notification_service.dto.NotificationRequest;
import com.example.notification_service.model.Notification;
import com.example.notification_service.model.RecipientRole;
import com.example.notification_service.repository.NotificationRepository;
import com.example.notification_service.security.JwtUtil;
import com.example.notification_service.service.NotificationService;
import io.jsonwebtoken.Jwt;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    private final JwtUtil jwtUtil;

    public NotificationController(JwtUtil jwtUtil){
        this.jwtUtil = jwtUtil;
    }


    @GetMapping
    public ResponseEntity<?> getMyNotifications(HttpServletRequest request) {
        // 1️⃣ Get token from cookies
        String token = null;
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("access_token".equals(cookie.getName())) { // <-- replace "token" with your cookie name
                    token = cookie.getValue();
                    if (token != null) {
                        token = token.trim(); // remove leading/trailing spaces
                    }
                    break;
                }
            }
        }

        String roleStr = jwtUtil.extractUserRole(token);

        if (!"ADMIN".equalsIgnoreCase(roleStr) && !"HR".equalsIgnoreCase(roleStr)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Only ADMIN or HR can register users."));
        }

        try {
            // Convert from "UNIVERSITY" → "University"
            String pascalCaseRole = roleStr.substring(0, 1).toUpperCase() +
                    roleStr.substring(1).toLowerCase();

            RecipientRole role = RecipientRole.valueOf(pascalCaseRole);

            List<Notification> notifications = notificationService.getNotificationsByRole(role);
            return ResponseEntity.ok(notifications);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid role: " + roleStr);
        }
    }

    @PostMapping("/create")
    public ResponseEntity<?> createNotification(@RequestBody NotificationRequest dto, HttpServletRequest request){
        String role = (String) request.getAttribute("role");

        if (!"ADMIN".equalsIgnoreCase(role)) {
            return errorResponse("Unauthorized: Only Admin can create notification.");
        }

        try{
           Notification newNotification = notificationService.createNotification(dto);

           Map<String, Object> response = new HashMap<>();
           response.put("message", "Notification created successfully!");
           response.put("success", true);
           response.put("data", newNotification);

           return ResponseEntity.ok().body(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(400).body(error);
        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id, HttpServletRequest request){
        String role = (String) request.getAttribute("role");

        if (!"ADMIN".equalsIgnoreCase(role)) {
            return errorResponse("Unauthorized: Only Admin can delete notification.");
        }

        try{

            notificationService.deleteNotificationById(id);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Notification deleted successfully!");
            response.put("success", true);

            return ResponseEntity.ok().body(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(400).body(error);
        }
    }



    private ResponseEntity<?> errorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }


}
