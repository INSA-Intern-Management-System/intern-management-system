package com.example.message_service.controller;

import com.example.message_service.dto.MessageResponseDTO;
import com.example.message_service.dto.RoomUserUnreadDTO;
import com.example.message_service.dto.UserResponseDTO;
import com.example.message_service.service.MessageService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
public class ApiController {

    private final MessageService messageService;

    @Autowired
    public ApiController(MessageService messageService) {
        this.messageService = messageService;
    }

    /**
     * Search users by name (first name or last name, paginated)
     * GET /api/messages/users/search?name=...
     */
    @GetMapping("/users/search")
    public ResponseEntity<?> searchUsersByName(@RequestParam String name, Pageable pageable,
                                               HttpServletRequest request) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.badRequest().body("User ID not found in request attributes");
            }
            if (name == null || name.isEmpty()) {
                return ResponseEntity.badRequest().body("Name parameter is required");
            }

            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Missing or invalid Authorization header");
            }
            String jwtToken = authHeader.substring(7);


            Page<UserResponseDTO> users = messageService.searchUsersByName(jwtToken,name, pageable);
            return ResponseEntity.ok(users);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    /**
     * Get rooms of current user, each with:
     * - room info
     * - the other user in the room
     * - unread message count
     * GET /api/messages/rooms
     */
    @GetMapping("/rooms")
    public ResponseEntity<?> getRoomsWithUserAndUnreadCount(HttpServletRequest request, Pageable pageable) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.badRequest().body("User ID not found in request attributes");
            }
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Missing or invalid Authorization header");
            }   
            String jwtToken = authHeader.substring(7);
            Page<RoomUserUnreadDTO> results = messageService.getRoomsWithUserAndUnreadCount(jwtToken,userId, pageable);
            return ResponseEntity.ok(results);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    /**
     * Get paginated messages by room id
     * GET /api/messages/rooms/{roomId}/messages
     */
    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<?> getMessagesByRoomId(@PathVariable Long roomId, Pageable pageable ,
                                                 HttpServletRequest request) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.badRequest().body("User ID not found in request attributes");
            }
            Page<MessageResponseDTO> messages = messageService.getMessagesByRoomId(roomId, pageable);
            return ResponseEntity.ok(messages);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    /**
     * Consistent error response helper
     */
    private ResponseEntity<Map<String, String>> errorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return ResponseEntity.badRequest().body(error);
    }
}
