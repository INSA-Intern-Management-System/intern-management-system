package com.example.message_service.repository;

import com.example.message_service.model.Room;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface RoomReposInterface {
    Room createRoom(Long user1Id, Long user2Id);
    void deleteRoom(Long roomId);
    Page<Room> getRoomsByUserId(Long userId, Pageable pageable);
    Optional<Room> getRoomById(Long roomId);
    Optional<Room> findRoomByUserIds(Long user1Id, Long user2Id);
    Room updateRoom(Room room);

}
