package com.example.message_service.dto;

import com.example.message_service.model.MessageStatus;

public class EditMessageStatusRequest {
    private Long messageId;
    private MessageStatus newStatus;  // e.g., "READ"

    public EditMessageStatusRequest() {}
    public EditMessageStatusRequest(Long messageId, MessageStatus newStatus) {
        this.messageId = messageId;
        this.newStatus = newStatus;
    }
    public Long getMessageId() { return messageId; }
    public void setMessageId(Long messageId) { this.messageId = messageId; }
    public MessageStatus getNewStatus() { return newStatus; }
    public void setNewStatus(MessageStatus newStatus) { this.newStatus = newStatus; }
}

