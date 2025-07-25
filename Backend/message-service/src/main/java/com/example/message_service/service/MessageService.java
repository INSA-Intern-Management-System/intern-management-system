package com.example.message_service.service;

import com.example.message_service.dto.*;
import com.example.message_service.model.*;
import com.example.message_service.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import java.util.Date;
import java.util.Optional;

@Service
public class MessageService {

    private final MessageReposInterface messageRepos;
    private final RoomReposInterface roomRepos;
    private final UserReposInterface userRepos;
    private final MapperService mapper;

    @Autowired
    public MessageService(MessageReposInterface messageRepos,
                          RoomReposInterface roomRepos,
                          UserReposInterface userRepos,
                          MapperService mapper) {
        this.messageRepos = messageRepos;
        this.roomRepos = roomRepos;
        this.userRepos = userRepos;
        this.mapper = mapper;
    }


    public Page<UserResponseDTO> searchUsersByName(String name, Pageable pageable) {
        return userRepos.searchByName(name, pageable).map(mapper::toUserResponseDTO);
    }

    /**
     * Get rooms by user ID → return UserResponseDTOs of other users in those rooms
     */
    public Page<RoomUserUnreadDTO> getRoomsWithUserAndUnreadCount(Long userId, Pageable pageable) {
        Page<Room> rooms = roomRepos.getRoomsByUserId(userId, pageable);

        return rooms.map(room -> {
            // find the other user
            Long otherUserId = room.getUser1().getId().equals(userId)
                    ? room.getUser2().getId()
                    : room.getUser1().getId();
            User otherUser = userRepos.getUser(otherUserId);
            Long unreadCount = messageRepos.countUnreadMessagesInRoomForReceiver(room.getId(), userId);
            RoomResponseDTO roomDto = mapper.toRoomResponseDTO(room);
            UserResponseDTO userDto = mapper.toUserResponseDTO(otherUser);

            return new RoomUserUnreadDTO(roomDto, userDto, unreadCount);
        });
    }


    /**
     * Send message (create room if not exist, else update lastMessageAt)
     */
    @Transactional
    public MessageResponseDTO sendMessage(WebSocketMessageDTO dto) {
        User sender = userRepos.getUser(dto.getSenderId());
        User receiver = userRepos.getUser(dto.getReceiverId());

        Room room;
        Optional<Room> existingRoom = roomRepos.findRoomByUserIds(dto.getSenderId(), dto.getReceiverId());
        if (existingRoom.isPresent()) {
            room = existingRoom.get();
            room.setLastMessageAt(new Date());
            roomRepos.updateRoom(room);
        } else {
            room = new Room(sender, receiver);
            room.setLastMessageAt(new Date());
            room = roomRepos.createRoom(sender.getId(), receiver.getId());
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
