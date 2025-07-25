package com.example.message_service.dto;

public class EditMessageRequest {
    private Long messageId;
    private String newContent;

    public EditMessageRequest() {}
    public EditMessageRequest(Long messageId, String newContent) {
        this.messageId = messageId;
        this.newContent = newContent;
    }
    public Long getMessageId() { return messageId; }
    public void setMessageId(Long messageId) { this.messageId = messageId; }
    public String getNewContent() { return newContent; }
    public void setNewContent(String newContent) { this.newContent = newContent; }
}

