package com.example.message_service.controller;

import com.example.message_service.dto.*;
import com.example.message_service.service.MessageService;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class WsController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public WsController(MessageService messageService, SimpMessagingTemplate messagingTemplate) {
        this.messageService = messageService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/send-message")
    public void sendMessage(@Payload WebSocketMessageDTO dto, SimpMessageHeaderAccessor headerAccessor) {
        // Extract JWT token from WebSocket session attributes (set during CONNECT)
        String jwtToken = getJwtFromSession(headerAccessor);

        if (jwtToken == null || jwtToken.isBlank()) {
            throw new IllegalArgumentException("Unauthorized: JWT token not found in WebSocket session. " +
                    "Ensure you connect using the header 'access-token: Bearer <token>'.");
        }

        try {
            // Call the service which handles gRPC validation + message persistence
            MessageResponseDTO savedMessage = messageService.sendMessage(jwtToken, dto);

            // Broadcast the message to subscribers of the room
            System.out.println("message: "+savedMessage.getRoomId());
            messagingTemplate.convertAndSend("/topic/rooms/" + savedMessage.getRoomId(), savedMessage);
        } catch (Exception e) {
            // Log or handle error appropriately
            System.err.println("Failed to send message: " + e.getMessage());
            // Optionally notify the client
        }
    }

    /**
     * Helper method to extract JWT from session attributes.
     */
    private String getJwtFromSession(SimpMessageHeaderAccessor headerAccessor) {
        Map<String, Object> sessionAttrs = headerAccessor.getSessionAttributes();
        if (sessionAttrs != null) {
            Object jwtObj = sessionAttrs.get("jwt");
            if (jwtObj instanceof String jwtStr) {
                return jwtStr;
            }
        }
        return null;
    }


    @MessageMapping("/edit-message")
    public void editMessage(EditMessageRequest dto) {
        MessageResponseDTO updated = messageService.editMessageContent(dto.getMessageId(), dto.getNewContent());
        messagingTemplate.convertAndSend("/topic/rooms/" + updated.getRoomId(), updated);
    }

    @MessageMapping("/edit-message-status")
    public void editMessageStatus(EditMessageStatusRequest dto) {
        MessageResponseDTO updated = messageService.editMessageStatus(dto.getMessageId(), dto.getNewStatus());
        messagingTemplate.convertAndSend("/topic/rooms/" + updated.getRoomId(), updated);
    }

    @MessageMapping("/delete-message")
    public void deleteMessage(DeleteMessageRequest dto) {
        messageService.deleteMessage(dto.getMessageId());
        messagingTemplate.convertAndSend("/topic/rooms/" + dto.getRoomId(),
                java.util.Map.of("deletedMessageId", dto.getMessageId()));
    }
    
}

