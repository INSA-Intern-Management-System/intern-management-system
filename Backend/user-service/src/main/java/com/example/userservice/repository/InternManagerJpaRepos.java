package com.example.userservice.repository;

import com.example.userservice.model.InternManager;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface InternManagerJpaRepos extends JpaRepository<InternManager, Long> {
    // Find InternManager record by the user's ID
    InternManager findByUser_Id(Long userId);

    //find list of internManger record using list of ids
    List<InternManager> findByUser_IdIn(List<Long> ids);
   
}

