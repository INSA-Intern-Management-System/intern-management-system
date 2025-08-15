package com.example.message_service.repository;

import com.example.message_service.model.Room;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomJpaRepos extends JpaRepository<Room, Long> {
    Page<Room> findByUser1_IdOrUser2_Id(Long user1Id, Long user2Id, Pageable pageable);
    Optional<Room> findByUser1_IdAndUser2_IdOrUser1_IdAndUser2_Id(Long user1Id, Long user2Id, Long user2IdAlt, Long user1IdAlt);

}
