package com.example.userservice.service;

import com.example.userservice.dto.LoginRequest;
import com.example.userservice.dto.RegisterRequest;
import com.example.userservice.model.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;

public interface UserService {

    // Auth related methods
    User registerUser(RegisterRequest request);
    User loginUser(LoginRequest request);

    // User related methods
    List<User> getAllUsers();
    void deleteUser(Long id);

    User  getUserById(Long id);
    User updateUser(Long id, User user);

    User saveUser(User user);

    User loadUserByEmail(String email);

}
