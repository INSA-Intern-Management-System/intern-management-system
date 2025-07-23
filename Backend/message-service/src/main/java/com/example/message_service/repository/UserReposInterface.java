package com.example.message_service.repository;

import com.example.message_service.model.User;
import java.util.List;

public interface UserReposInterface {
    User getUser(Long id);
    List<User> getUsersByIds(List<Long> ids);
}
