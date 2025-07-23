package com.example.message_service.repository;

import com.example.message_service.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserJpaRepos extends JpaRepository<User, Long> {
    List<User> findAllByIdIn(List<Long> ids);
}
