package com.example.userservice.controller;


import com.example.userservice.dto.AuthResponse;
import com.example.userservice.dto.LoginRequest;
import com.example.userservice.dto.RegisterRequest;
import com.example.userservice.model.User;
import com.example.userservice.security.JwtUtil;
import com.example.userservice.service.CustomUserDetailsService;
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
    private final CustomUserDetailsService customUserDetailsService;
    private final  JwtUtil jwtUtil;


    public AuthController(UserService userService, JwtUtil jwtUtil, CustomUserDetailsService customUserDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userService = userService;
        this.customUserDetailsService = customUserDetailsService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User user = userService.registerUser(request);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "User registered successfully");
            response.put("user", user);

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

            UserDetails userDetails = customUserDetailsService.loadUserByUsername(user.getEmail());
            String token = jwtUtil.generateToken(userDetails, user.getLastLogin());

            System.out.println("JWT Token generated: " + token);

            AuthResponse authResponse = new AuthResponse(
                    "User logged in successfully",
                    token,
                    user
            );

            return ResponseEntity.status(201).body(authResponse);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());

            return ResponseEntity.status(400).body(error);
        }
    }


}
