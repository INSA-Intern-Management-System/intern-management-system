package com.example.userservice.repository;

import com.example.userservice.model.InternManager;

import org.springframework.data.jpa.repository.JpaRepository;

public interface InternManagerJpaRepos extends JpaRepository<InternManager, Long> {
    // Find InternManager record by the user's ID
    InternManager findByUser_Id(Long userId);
   
}

