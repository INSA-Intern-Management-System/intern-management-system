package com.example.application_service.services;

import com.example.application_service.dto.UserResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class UserServiceClient {

    private final RestTemplate restTemplate;

    @Autowired
    public UserServiceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public UserResponseDTO validateToken(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", token);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<UserResponseDTO> response = restTemplate.exchange(
                "http://localhost:8082/api/auth/validate", // Replace with actual URL or service name if using Eureka
                HttpMethod.GET,
                entity,
                UserResponseDTO.class
        );

        return response.getBody();
    }
}
