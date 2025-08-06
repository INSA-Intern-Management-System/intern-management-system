package com.example.message_service.dto;

import java.util.Date;

public class WebSocketRoomDTO {
    private Long roomId;
    private Long user1Id;
    private Long user2Id;
    private Date lastMessageAt;

    public WebSocketRoomDTO() {}

    public WebSocketRoomDTO(Long roomId, Long user1Id, Long user2Id, Date lastMessageAt) {
        this.roomId = roomId;
        this.user1Id = user1Id;
        this.user2Id = user2Id;
        this.lastMessageAt = lastMessageAt;
    }

    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }

    public Long getUser1Id() { return user1Id; }
    public void setUser1Id(Long user1Id) { this.user1Id = user1Id; }

    public Long getUser2Id() { return user2Id; }
    public void setUser2Id(Long user2Id) { this.user2Id = user2Id; }

    public Date getLastMessageAt() { return lastMessageAt; }
    public void setLastMessageAt(Date lastMessageAt) { this.lastMessageAt = lastMessageAt; }
}
