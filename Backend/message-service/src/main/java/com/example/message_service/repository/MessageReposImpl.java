package com.example.message_service.repository;

import com.example.message_service.model.Message;
import com.example.message_service.model.MessageStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class MessageReposImpl implements MessageReposInterface {
    private final MessageJpaRepos messageJpaRepos;

    @Autowired
    public MessageReposImpl(MessageJpaRepos messageJpaRepos) {
        this.messageJpaRepos = messageJpaRepos;
    }

    @Override
    public Message createMessage(Message message) {
        // You might still validate message fields if needed (e.g., sender, receiver, room != null)
        
        return messageJpaRepos.save(message);
    }

    @Override
    public Message editMessageContent(Long messageId, String newContent) {
        return messageJpaRepos.findById(messageId)
            .map(existing -> {
                existing.setContent(newContent);
                return messageJpaRepos.save(existing);
            })
            .orElseThrow(() -> new RuntimeException("Message not found with ID: " + messageId));
    }

    @Override
    public Message editMessageStatus(Long messageId, MessageStatus newStatus) {
        return messageJpaRepos.findById(messageId)
            .map(existing -> {
                existing.setStatus(newStatus);
                return messageJpaRepos.save(existing);
            })
            .orElseThrow(() -> new RuntimeException("Message not found with ID: " + messageId));
    }

    @Override
    public void deleteMessage(Long messageId) {
        if (messageJpaRepos.existsById(messageId)) {
            messageJpaRepos.deleteById(messageId);
        } else {
            throw new RuntimeException("Message not found with ID: " + messageId);
        }
    }

    @Override
    public Page<Message> getMessagesByRoomId(Long roomId, Pageable pageable) {
        return messageJpaRepos.findByRoom_Id(roomId, pageable);
    }

    @Override
    public Long getNumberOfUnreadMessages(Long receiverId) {
        return messageJpaRepos.countByReceiver_IdAndStatus(receiverId, MessageStatus.UNREAD);
    }

    @Override
    public Optional<Message> getMessageById(Long messageId) {
        return messageJpaRepos.findById(messageId);
    }
    @Override
    public Long countUnreadMessagesInRoomForReceiver(Long roomId, Long receiverId) {
        return messageJpaRepos.countByRoom_IdAndReceiver_IdAndStatus(roomId, receiverId, MessageStatus.UNREAD);
    }

}
