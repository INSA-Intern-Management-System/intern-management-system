package com.example.message_service.repository;

import com.example.message_service.model.User;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserJpaRepos extends JpaRepository<User, Long> {
    List<User> findAllByIdIn(List<Long> ids);
    Page<User> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
            String firstNameKeyword, String lastNameKeyword, Pageable pageable);
}
