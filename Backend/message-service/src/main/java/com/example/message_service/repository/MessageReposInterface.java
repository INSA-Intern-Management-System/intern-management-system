package com.example.message_service.repository;

import com.example.message_service.model.Message;
import com.example.message_service.model.MessageStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface MessageReposInterface {

    Message createMessage(Message message);

    Message editMessageContent(Long messageId, String newContent);

    Message editMessageStatus(Long messageId, MessageStatus newStatus);

    void deleteMessage(Long messageId);

    Page<Message> getMessagesByRoomId(Long roomId, Pageable pageable);

    Long getNumberOfUnreadMessages(Long receiverId);

    Optional<Message> getMessageById(Long messageId);
    
    Long countUnreadMessagesInRoomForReceiver(Long roomId, Long receiverId);

}
