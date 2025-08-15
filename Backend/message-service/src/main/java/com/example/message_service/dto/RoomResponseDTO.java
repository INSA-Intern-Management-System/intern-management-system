package com.example.message_service.dto;

import java.util.Date;

public class RoomResponseDTO {
    private Long id;
    private Long user1Id;
    private Long user2Id;
    private Date lastMessageAt;
    private Date createdAt;

    public RoomResponseDTO() {}

    public RoomResponseDTO(Long id, Long user1Id, Long user2Id, Date lastMessageAt, Date createdAt) {
        this.id = id;
        this.user1Id = user1Id;
        this.user2Id = user2Id;
        this.lastMessageAt = lastMessageAt;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUser1Id() { return user1Id; }
    public void setUser1Id(Long user1Id) { this.user1Id = user1Id; }

    public Long getUser2Id() { return user2Id; }
    public void setUser2Id(Long user2Id) { this.user2Id = user2Id; }

    public Date getLastMessageAt() { return lastMessageAt; }
    public void setLastMessageAt(Date lastMessageAt) { this.lastMessageAt = lastMessageAt; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
}
