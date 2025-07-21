package com.example.userservice.controller;


import com.example.userservice.dto.AuthResponse;
import com.example.userservice.dto.LoginRequest;
import com.example.userservice.dto.RegisterRequest;
import com.example.userservice.dto.UserResponseDto;
import com.example.userservice.model.User;
import com.example.userservice.security.JwtUtil;
import com.example.userservice.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;
import java.util.Collections;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final  JwtUtil jwtUtil;



    public AuthController(UserService userService,

                          JwtUtil jwtUtil
                           ) {
        this.jwtUtil = jwtUtil;
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User user = userService.registerUser(request);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "User registered successfully");
            response.put("user", new UserResponseDto(user));
            return ResponseEntity.status(201).body(response);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());

            return ResponseEntity.status(400).body(error);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            User user = userService.loginUser(request);

            user.setLastLogin(new Date());
            userService.saveUser(user);

            User singleUser = userService.loadUserByEmail(user.getEmail());
            String token = jwtUtil.generateToken(singleUser, user.getLastLogin());

            // ✅ Extract data from the token
            Long userIdFromToken = jwtUtil.extractUserId(token);
            String roleFromToken = jwtUtil.extractRole(token);
            String emailFromToken = jwtUtil.extractEmail(token);

            // ✅ Print values
            System.out.println("User ID from token: " + userIdFromToken);
            System.out.println("Role from token: " + roleFromToken);
            System.out.println("Email from token: " + emailFromToken);

            AuthResponse authResponse = new AuthResponse(
                    "User logged in successfully",
                    token,
                    new UserResponseDto(user)
            );

            return ResponseEntity.status(201).body(authResponse);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());

            return ResponseEntity.status(400).body(error);
        }
    }



}
