package com.example.message_service.repository;

import com.example.message_service.model.Message;
import com.example.message_service.model.MessageStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageJpaRepos extends JpaRepository<Message, Long> {
    Page<Message> findByRoom_Id(Long roomId, Pageable pageable);

    Long countByReceiver_IdAndStatus(Long receiverId, MessageStatus status);
    Long countByRoom_IdAndReceiver_IdAndStatus(Long roomId, Long receiverId, MessageStatus status);

}
