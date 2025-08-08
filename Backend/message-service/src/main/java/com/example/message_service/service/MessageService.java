package com.example.message_service.service;

import com.example.message_service.client.UserGrpcClient;
import com.example.message_service.dto.*;
import com.example.message_service.model.*;
import com.example.message_service.repository.*;
import com.example.userservice.gRPC.SearchByNameResponse;
import com.example.userservice.gRPC.UserResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MessageService {

    private final MessageReposInterface messageRepos;
    private final RoomReposInterface roomRepos;
    private final MapperService mapper;
    private final UserGrpcClient userGrpcClient;

    @Autowired
    public MessageService(MessageReposInterface messageRepos,
                          RoomReposInterface roomRepos,
                          MapperService mapper,
                          UserGrpcClient userGrpcClient) {
        this.messageRepos = messageRepos;
        this.roomRepos = roomRepos;
        this.mapper = mapper;
        this.userGrpcClient = userGrpcClient;
    }


    public Page<UserResponseDTO> searchUsersByName(String jwtToken,String name, Pageable pageable) {
        // Call gRPC service to get users by name/ page and size
        SearchByNameResponse response = userGrpcClient.searchByName(jwtToken, name, pageable.getPageNumber(), pageable.getPageSize());
        if (response == null || response.getUsersList().isEmpty()) {
            return Page.empty(pageable);
        }
        // Map gRPC response to UserResponseDTOs
        List<UserResponseDTO> userDtos = response.getUsersList().stream()
                .map(mapper::toUserResponseDTO)
                .collect(Collectors.toList());

        // Return as Page object
        return new PageImpl<>(userDtos, pageable, response.getUsersCount());
    }
    

    /**
     * Get rooms by user ID → return UserResponseDTOs of other users in those rooms
     */
    public Page<RoomUserUnreadDTO> getRoomsWithUserAndUnreadCount(String jwtToken,Long userId, Pageable pageable) {
        Page<Room> rooms = roomRepos.getRoomsByUserId(userId, pageable);
        if (rooms.isEmpty()) {
            return Page.empty(pageable);
        }
        //collect user ids of other users in rooms
        List<Long> otherUserIds = rooms.getContent().stream()
                .map(room -> room.getUser1().getId().equals(userId) ? room.getUser2().getId() : room.getUser1().getId())
                .distinct()
                .collect(Collectors.toList());
        
        // Call gRPC service to get user details
        List<UserResponse> userResponses = userGrpcClient.getAllUsers(jwtToken, otherUserIds).getUsersList();
        if (userResponses.isEmpty()) {
            return Page.empty(pageable);
        }

        // Map gRPC responses to UserResponseDTOs
        List<UserResponseDTO> userDtos = userResponses.stream()
                .map(mapper::toUserResponseDTO)
                .collect(Collectors.toList());

        // Create RoomUserUnreadDTOs with unread message counts
        List<RoomUserUnreadDTO> roomUserUnreadDtos = new ArrayList<>();
        for (Room room : rooms.getContent()) {
            Long otherUserId = room.getUser1().getId().equals(userId) ? room.getUser2().getId() : room.getUser1().getId();
            UserResponseDTO otherUserDto = userDtos.stream()
                    .filter(dto -> dto.getId().equals(otherUserId))
                    .findFirst()
                    .orElse(null);
            if (otherUserDto != null) {
                Long unreadCount = messageRepos.countUnreadMessagesInRoomForReceiver(room.getId(), userId);
                RoomResponseDTO roomDto = mapper.toRoomResponseDTO(room);
                roomUserUnreadDtos.add(new RoomUserUnreadDTO(roomDto, otherUserDto, unreadCount));
            }
        }
        //sort by last message date
        roomUserUnreadDtos.sort((a, b) -> b.getRoom().getLastMessageAt().compareTo(a.getRoom().getLastMessageAt()));
        return new PageImpl<>(roomUserUnreadDtos, pageable, rooms.getTotalElements());
    }


    /**
     * Send message (create room if not exist, else update lastMessageAt)
     */
    @Transactional
    public MessageResponseDTO sendMessage(String jwtToken,WebSocketMessageDTO dto) {

        UserResponse senderResponse = userGrpcClient.getUserById(jwtToken, dto.getSenderId());
        if (senderResponse == null) {
            throw new RuntimeException("Sender user not found");
        }

        UserResponse receiverResponse = userGrpcClient.getUserById(jwtToken, dto.getReceiverId());
        if (receiverResponse == null) {
            throw new RuntimeException("Receiver user not found");
        }
        // Convert gRPC responses to User entities
        User sender = new User(senderResponse.getUserId());
        User receiver = new User(receiverResponse.getUserId());

        //define room->create or update existing room
        Room room;
        Optional<Room> existingRoom = roomRepos.findRoomByUserIds(dto.getSenderId(), dto.getReceiverId());
        if (existingRoom.isPresent()) {
            room = existingRoom.get();
            room.setLastMessageAt(new Date());
            roomRepos.updateRoom(room);
        } else {
            room = new Room(sender, receiver);
            room.setLastMessageAt(new Date());
            room = roomRepos.createRoom(new User(sender.getId()),new User(receiver.getId()));
        }

        Message message = new Message(sender, receiver, dto.getContent(), MessageStatus.UNREAD);
        message.setRoom(room);
        Message saved = messageRepos.createMessage(message);
        return mapper.toMessageResponseDTO(saved);
    }

    /**
     * Edit message content
     */
    @Transactional
    public MessageResponseDTO editMessageContent(Long messageId, String newContent) {
        Message updated = messageRepos.editMessageContent(messageId, newContent);
        return mapper.toMessageResponseDTO(updated);
    }

    /**
     * Edit message status
     */
    @Transactional
    public MessageResponseDTO editMessageStatus(Long messageId, MessageStatus newStatus) {
        Message updated = messageRepos.editMessageStatus(messageId, newStatus);
        return mapper.toMessageResponseDTO(updated);
    }

    /**
     * Delete message
     */
    @Transactional
    public void deleteMessage(Long messageId) {
        messageRepos.deleteMessage(messageId);
    }

    /**
     * Get messages by room id
     */
    public Page<MessageResponseDTO> getMessagesByRoomId(Long roomId, Pageable pageable) {
        return messageRepos.getMessagesByRoomId(roomId, pageable).map(mapper::toMessageResponseDTO);
    }

    /**
     * Count unread messages for user
     */
    public Long getUnreadMessageCount(Long receiverId) {
        return messageRepos.getNumberOfUnreadMessages(receiverId);
    }
}
