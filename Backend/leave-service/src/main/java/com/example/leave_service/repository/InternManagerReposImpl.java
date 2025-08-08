package com.example.leave_service.repository;

import com.example.leave_service.model.InternManager;
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
    public Long getManagerIdByUserId(Long userId) {
        InternManager internManager = internManagerJpaRepos.findByUser_Id(userId);
        return (internManager != null && internManager.getManager() != null)
                ? internManager.getManager().getId()
                : null;
    }
}
