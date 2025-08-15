package com.example.message_service.repository;

import com.example.message_service.model.Room;
import com.example.message_service.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class RoomReposImpl implements RoomReposInterface {
    private final RoomJpaRepos roomJpaRepos;

    @Autowired
    public RoomReposImpl(RoomJpaRepos roomJpaRepos) {
        this.roomJpaRepos = roomJpaRepos;
    }

    @Override
    public Room createRoom(User user1, User user2) {
        if (user1 == null || user2 == null) {
            throw new IllegalArgumentException("Both users must be provided to create a room");
        }
        Room room = new Room(user1, user2);
        return roomJpaRepos.save(room);
    }

    @Override
    public void deleteRoom(Long roomId) {
        roomJpaRepos.deleteById(roomId);
    }

    @Override
    public Page<Room> getRoomsByUserId(Long userId, Pageable pageable) {
        return roomJpaRepos.findByUser1_IdOrUser2_Id(userId, userId, pageable);
    }

    @Override
    public Optional<Room> getRoomById(Long roomId) {
        return roomJpaRepos.findById(roomId);
    }
    @Override
    public Optional<Room> findRoomByUserIds(Long user1Id, Long user2Id) {
        return roomJpaRepos.findByUser1_IdAndUser2_IdOrUser1_IdAndUser2_Id(
                user1Id, user2Id, user2Id, user1Id
        );
    }

    @Override
    public Room updateRoom(Room room) {
        return roomJpaRepos.save(room);
    }

}
