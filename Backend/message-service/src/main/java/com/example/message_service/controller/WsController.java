package com.example.message_service.controller;

import com.example.message_service.dto.*;
import com.example.message_service.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
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
    public void sendMessage(WebSocketMessageDTO dto) {
        MessageResponseDTO saved = messageService.sendMessage(dto);
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

