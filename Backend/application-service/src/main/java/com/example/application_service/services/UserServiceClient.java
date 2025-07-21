package com.example.application_service.client;

import com.example.application_service.client.dto.UserResponseDto;
import com.example.application_service.dto.UserResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service", url = "${user.service.url}") // configure in application.properties
public interface UserServiceClient {

    @GetMapping("/api/users/{id}")
    UserResponseDTO getUserById(@PathVariable("id") Integer id);
}
