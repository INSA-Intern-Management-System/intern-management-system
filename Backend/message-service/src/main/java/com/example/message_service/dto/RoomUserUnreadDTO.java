package com.example.message_service.dto;

public class RoomUserUnreadDTO {
    private RoomResponseDTO room;
    private UserResponseDTO user;
    private Long unreadCount;

    public RoomUserUnreadDTO() {}

    public RoomUserUnreadDTO(RoomResponseDTO room, UserResponseDTO user, Long unreadCount) {
        this.room = room;
        this.user = user;
        this.unreadCount = unreadCount;
    }

    public RoomResponseDTO getRoom() { return room; }
    public void setRoom(RoomResponseDTO room) { this.room = room; }

    public UserResponseDTO getUser() { return user; }
    public void setUser(UserResponseDTO user) { this.user = user; }

    public Long getUnreadCount() { return unreadCount; }
    public void setUnreadCount(Long unreadCount) { this.unreadCount = unreadCount; }
}
