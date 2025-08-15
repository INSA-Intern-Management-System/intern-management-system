package com.example.userservice.service;

import com.example.userservice.dto.*;
import com.example.userservice.model.User;
import org.springframework.stereotype.Service;

@Service
public class MapperService {

    public UserMessageDTO toUserMessageDTO(User user) {
        return new UserMessageDTO(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getFieldOfStudy(),
                user.getInstitution(),
                user.getStatus(),
                user.getRole()
        );
    }

}
