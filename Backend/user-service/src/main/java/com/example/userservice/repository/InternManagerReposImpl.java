package com.example.userservice.repository;

import com.example.userservice.model.InternManager;

import java.util.ArrayList;
import java.util.List;

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
        return internManagerJpaRepos.findByUser_Id(userId);
    }

    @Override
    public List<InternManager> getInfos(List<Long> userIds) {
        return internManagerJpaRepos.findByUser_IdIn(userIds);
    }

    @Override
    public InternManager save(InternManager internManager) {
        return internManagerJpaRepos.save(internManager);
    }
}
