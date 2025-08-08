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
        // extract jwt token from session attributes (stored at CONNECT time)
        Map<String, Object> sessionAttrs = headerAccessor.getSessionAttributes();
        String jwtToken = null;
        if (sessionAttrs != null) {
            Object jwtObj = sessionAttrs.get("jwt");
            if (jwtObj instanceof String) {
                jwtToken = (String) jwtObj;
            }
        }

        if (jwtToken == null || jwtToken.isBlank()) {
            // Optionally send error message to user, or throw
            throw new IllegalArgumentException("Unauthorized: JWT token not found in WebSocket session. Make sure to CONNECT with 'access-token: Bearer <token>' header.");
        }

        // Service call that uses grpc to validate/fetch users and persist message
        MessageResponseDTO saved = messageService.sendMessage(jwtToken, dto);
        messagingTemplate.convertAndSend("/topic/rooms/" + saved.getRoomId(), saved);
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

