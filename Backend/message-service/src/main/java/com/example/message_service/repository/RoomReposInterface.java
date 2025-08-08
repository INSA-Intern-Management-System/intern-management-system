package com.example.message_service.repository;

import com.example.message_service.model.Room;
import com.example.message_service.model.User;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface RoomReposInterface {
    Room createRoom(User user1, User user2);
    void deleteRoom(Long roomId);
    Page<Room> getRoomsByUserId(Long userId, Pageable pageable);
    Optional<Room> getRoomById(Long roomId);
    Optional<Room> findRoomByUserIds(Long user1Id, Long user2Id);
    Room updateRoom(Room room);

}
