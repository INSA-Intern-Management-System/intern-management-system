package com.example.userservice.repository;

import com.example.userservice.model.InternManager;
import com.example.userservice.model.User;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface InternManagerJpaRepos extends JpaRepository<InternManager, Long> {
    // Find InternManager record by the user's ID
    InternManager findByUser_Id(Long userId);
    //search for users by their first name with specified role
    List<User> findByFirstNameContainingIgnoreCaseAndRole(String firstName, String role);
}

