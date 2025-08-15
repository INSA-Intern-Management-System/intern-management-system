package com.example.message_service.dto;

public class DeleteMessageRequest {
    private Long messageId;
    private Long roomId;

    public DeleteMessageRequest() {}
    public DeleteMessageRequest(Long messageId, Long roomId) {
        this.messageId = messageId;
        this.roomId = roomId;
    }
    public Long getMessageId() { return messageId; }
    public void setMessageId(Long messageId) { this.messageId = messageId; }
    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }
}

