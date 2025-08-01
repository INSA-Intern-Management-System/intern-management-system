package com.example.userservice.repository;

import java.util.List;

import com.example.userservice.model.InternManager;
import com.example.userservice.model.User;

public interface InternManagerReposInterface {
    InternManager getInfo(Long userId);
    List<User> searchByName(String name, String role); 
}

