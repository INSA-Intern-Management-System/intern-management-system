package com.example.userservice.repository;

import com.example.userservice.model.InternManager;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

@Repository
public class InternManagerReposImpl implements InternManagerReposInterface {

    private final InternManagerJpaRepos internManagerJpaRepos;

    @Autowired
    public InternManagerReposImpl(InternManagerJpaRepos internManagerJpaRepos) {
        this.internManagerJpaRepos = internManagerJpaRepos;
    }

    @Override
    public InternManager getInfo(Long userId) {
        InternManager internManager = internManagerJpaRepos.findByUser_Id(userId);
        if (internManager != null) {
            return internManager;
        } else {
            throw new RuntimeException("Intern Manager not found for user ID: " + userId);
        }
    }
  
}
