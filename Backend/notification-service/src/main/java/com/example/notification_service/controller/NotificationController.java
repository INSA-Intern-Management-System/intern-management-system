
package com.example.notification_service.controller;


import com.example.notification_service.dto.NotificationRequest;
import com.example.notification_service.dto.NotificationResponse;
import com.example.notification_service.dto.RecipientResponse;
import com.example.notification_service.model.Notification;
import com.example.notification_service.model.NotificationRecipients;
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

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
                    break;
                }
            }
        }

        if (token == null) {
            return ResponseEntity.status(401).body("Missing access_token cookie");
        }
        String roleStr = (String) request.getAttribute("role");

        try {
            String enumRole;

            if ("HR".equalsIgnoreCase(roleStr)) {
                // Keep HR as-is
                enumRole = "HR";
            } else {
                // Convert roles like "PROJECT_MANAGER" → "Project_Manager"
                enumRole = Arrays.stream(roleStr.split("_"))
                        .map(s -> s.substring(0, 1).toUpperCase() + s.substring(1).toLowerCase())
                        .collect(Collectors.joining("_")); // join with underscore
            }

            RecipientRole role = RecipientRole.valueOf(enumRole);

            List<Notification> notifications = notificationService.getNotificationsByRole(role);
            return ResponseEntity.ok(notifications);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid role: " + roleStr);
        }

    }

    @PostMapping("/create")
    public ResponseEntity<?> createNotification(@RequestBody NotificationRequest dto, HttpServletRequest request) {
        // ✅ Extract token from cookies
        String jwtToken = null;
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("access_token".equals(cookie.getName())) {
                    jwtToken = cookie.getValue();
                    break;
                }
            }
        }
        if (jwtToken == null) {
            return ResponseEntity.status(401).body("Missing access_token cookie");
        }

        // ✅ Check if user is ADMIN
        String role = (String) request.getAttribute("role");
        if (!"ADMIN".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Only Admin can get this resource!"));
        }

        // ✅ Validate roles are provided
        if (dto.getRoles() == null || dto.getRoles().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "At least one recipient role must be provided"));
        }

        try {
            Notification newNotification = notificationService.createNotification(dto);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Notification created successfully!");
            response.put("success", true);
            response.put("data", newNotification);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id, HttpServletRequest request){
        String jwtToken = null;
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("access_token".equals(cookie.getName())) {
                    jwtToken = cookie.getValue();
                    break;
                }
            }
        }
        if (jwtToken == null) {
            return ResponseEntity.status(401).body("Missing access_token cookie");
        }

        String role = (String) request.getAttribute("role");
        if(!"ADMIN".equalsIgnoreCase(role)){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Only Admin can get this resource!"));
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


    @PutMapping("/mark-as-read/{id}")
    public ResponseEntity<?> markAsRead(@PathVariable Long id, HttpServletRequest request) {
        try {
            // Extract JWT token from cookie (optional if Spring Security handles it)
            String jwtToken = null;
            if (request.getCookies() != null) {
                for (Cookie cookie : request.getCookies()) {
                    if ("access_token".equals(cookie.getName())) {
                        jwtToken = cookie.getValue();
                        break;
                    }
                }
            }
            if (jwtToken == null) {
                return ResponseEntity.status(401).body("Missing access_token cookie");
            }

            // Get role from request attribute
            String roleString = (String) request.getAttribute("role");
            if (roleString == null) {
                return ResponseEntity.status(403).body("User role not found");
            }

            RecipientRole role;
            try {
                role = normalizeRole(roleString);
            } catch (IllegalArgumentException ex) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Invalid role: " + roleString);
            }

            // Mark notification as read
            Notification notification = notificationService.markAsRead(id, role);

            // Map to Response DTO
            NotificationResponse responseDto = new NotificationResponse();
            responseDto.setId(notification.getId());
            responseDto.setTitle(notification.getTitle());
            responseDto.setDescription(notification.getDescription());
            responseDto.setType(notification.getType());
            responseDto.setRoles(notification.getRoles());
            responseDto.setCreatedAt(notification.getCreatedAt());

            List<RecipientResponse> recipients = notification.getRecipients().stream().map(r -> {
                RecipientResponse recDto = new RecipientResponse();
                recDto.setId(r.getId());
                recDto.setRole(r.getRole());
                recDto.setRead(r.isRead());
                return recDto;
            }).toList();

            responseDto.setRecipients(recipients);

            return ResponseEntity.ok(responseDto);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while marking notification as read: " + e.getMessage());
        }
    }

    @PutMapping("/mark-all-as-read")
    public ResponseEntity<?> markAllAsRead(HttpServletRequest request) {
        try {
            String jwtToken = null;
            if (request.getCookies() != null) {
                for (Cookie cookie : request.getCookies()) {
                    if ("access_token".equals(cookie.getName())) {
                        jwtToken = cookie.getValue();
                        break;
                    }
                }
            }
            if (jwtToken == null) {
                return ResponseEntity.status(401).body("Missing access_token cookie");
            }

            // ✅ Get role from request attribute
            String roleString = (String) request.getAttribute("role");
            if (roleString == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Role not found in request");
            }
            // ✅ Convert role string (uppercase) to enum
            RecipientRole role;
            try {
                role = normalizeRole(roleString);
            } catch (IllegalArgumentException ex) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Invalid role: " + roleString);
            }

            List<NotificationRecipients> notifications = notificationService.markAllAsRead(role);

            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while marking notifications as read: " + e.getMessage());
        }
    }


    //Helper method
    private ResponseEntity<?> errorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    private RecipientRole normalizeRole(String roleString) {
        if (roleString == null) {
            throw new IllegalArgumentException("Role is null");
        }

        if ("HR".equalsIgnoreCase(roleString)) {
            return RecipientRole.HR; // keep HR exactly as enum
        }

        // For roles like PROJECT_MANAGER → Project_Manager, SUPERVISOR → Supervisor
        String normalized = Arrays.stream(roleString.split("_"))
                .map(s -> s.substring(0, 1).toUpperCase() + s.substring(1).toLowerCase())
                .collect(Collectors.joining("_"));

        return RecipientRole.valueOf(normalized);
    }



}
