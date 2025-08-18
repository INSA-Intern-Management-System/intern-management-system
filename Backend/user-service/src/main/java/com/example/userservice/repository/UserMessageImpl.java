package com.example.userservice.repository;


import com.example.userservice.dto.UserMessageDTO;
import com.example.userservice.model.User;
import com.example.userservice.service.MapperService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class UserMessageImpl implements UserMessageInterface {

    @Autowired
    private UserMessageJpa userMessageJpa;

    @Autowired
    private MapperService mapperService;

    @Override
    public UserMessageDTO getUser(Long id) {
        Optional<User> optionalUser = userMessageJpa.findById(id);
        return optionalUser.map(mapperService::toUserMessageDTO)
                .orElse(null);
    }

    @Override
    public List<UserMessageDTO> getUsersByIds(List<Long> ids) {
        return userMessageJpa.findAllByIdIn(ids)
                .stream()
                .map(mapperService::toUserMessageDTO)
                .toList();
    }

    @Override
    public Page<UserMessageDTO> searchByName(String keyword, Pageable pageable) {
        // Use the same keyword for both firstName and lastName fields
        return userMessageJpa.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
                keyword, keyword, pageable).map(mapperService::toUserMessageDTO);
    }
    @Override
    public int countByName(String keyword) {
        // Use the same keyword for both firstName and lastName fields
        return userMessageJpa.countByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
                keyword, keyword);
    }

}

