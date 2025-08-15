package com.example.userservice.repository;
import com.example.userservice.dto.UserMessageDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserMessageInterface {
    UserMessageDTO getUser(Long id);
    List<UserMessageDTO> getUsersByIds(List<Long> ids);
    Page<UserMessageDTO> searchByName(String keyword, Pageable pageable);
    int countByName(String keyword);
}
