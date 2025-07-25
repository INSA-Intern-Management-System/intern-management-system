package com.example.message_service.dto;

import java.util.Date;

public class MessageResponseDTO {
    private Long id;
    private Long senderId;
    private Long roomId;
    private Long receiverId;
    private String content;
    private String status;
    private Date createdAt;
    private Date updatedAt;

    public MessageResponseDTO() {}

    public MessageResponseDTO(Long id, Long senderId,Long roomId, Long receiverId, String content,
                              String status, Date createdAt, Date updatedAt) {
        this.id = id;
        this.senderId = senderId;
        this.roomId = roomId;
        this.receiverId = receiverId;
        this.content = content;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }

    public Long getReceiverId() { return receiverId; }
    public void setReceiverId(Long receiverId) { this.receiverId = receiverId; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }

    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }

    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId;};
}
