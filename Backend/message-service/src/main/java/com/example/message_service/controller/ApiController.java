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
    public ResponseEntity<?> searchUsersByName(@RequestParam String name, Pageable pageable) {
        try {
            Page<UserResponseDTO> users = messageService.searchUsersByName(name, pageable);
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
            Page<RoomUserUnreadDTO> results = messageService.getRoomsWithUserAndUnreadCount(userId, pageable);
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
    public ResponseEntity<?> getMessagesByRoomId(@PathVariable Long roomId, Pageable pageable) {
        try {
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
