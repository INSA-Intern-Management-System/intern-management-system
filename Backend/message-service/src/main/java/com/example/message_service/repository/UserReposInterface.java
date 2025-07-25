package com.example.message_service.repository;

import com.example.message_service.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserReposInterface {
    User getUser(Long id);
    List<User> getUsersByIds(List<Long> ids);
    Page<User> searchByName(String keyword, Pageable pageable);
}
