package com.example.message_service.repository;

import com.example.message_service.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class UserReposImpl implements UserReposInterface {

    @Autowired
    private UserJpaRepos userJpaRepos;

    @Override
    public User getUser(Long id) {
        Optional<User> optionalUser = userJpaRepos.findById(id);
        return optionalUser.orElse(null);
    }

    @Override
    public List<User> getUsersByIds(List<Long> ids) {
        return userJpaRepos.findAllByIdIn(ids);
    }
}
