package com.example.message_service.service;

import com.example.message_service.dto.*;
import com.example.message_service.model.Message;
import com.example.message_service.model.Room;
import com.example.message_service.model.User;
import org.springframework.stereotype.Service;

@Service
public class MapperService {

    public UserResponseDTO toUserResponseDTO(User user) {
        return new UserResponseDTO(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getFieldOfStudy(),
                user.getUniversity(),
                user.getStatus(),
                user.getRole()
        );
    }

    public RoomResponseDTO toRoomResponseDTO(Room room) {
        return new RoomResponseDTO(
                room.getId(),
                room.getUser1().getId(),
                room.getUser2().getId(),
                room.getLastMessageAt(),
                room.getCreatedAt()
        );
    }

    public MessageResponseDTO toMessageResponseDTO(Message message) {
        return new MessageResponseDTO(
                message.getId(),
                message.getSender().getId(),
                message.getRoom().getId(),
                message.getReceiver().getId(),
                message.getContent(),
                message.getStatus().name(),
                message.getCreatedAt(),
                message.getUpdatedAt()
        );
    }
}
