package com.example.message_service.service;

import com.example.message_service.dto.*;
import com.example.message_service.model.Message;
import com.example.message_service.model.Room;
import com.example.message_service.model.UserStatus;
import com.example.userservice.gRPC.UserResponse;

import org.springframework.stereotype.Service;

@Service
public class MapperService {

    public UserResponseDTO toUserResponseDTO(UserResponse grpcResponse) {
        return new UserResponseDTO(
                grpcResponse.getUserId(),
                grpcResponse.getFirstName(),
                grpcResponse.getLastName(),
                grpcResponse.getFieldOfStudy(),
                grpcResponse.getUniversity(),
                grpcResponse.getStatus() == com.example.userservice.gRPC.Status.ONLINE ? UserStatus.ONLINE : UserStatus.OFFLINE,
                grpcResponse.getRole().getName()
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
