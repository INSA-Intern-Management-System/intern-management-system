package com.example.userservice.dto;

public class AuthResponse {
    private String message;
    private boolean forcePasswordChange; // ✅ New field
//    private String token;
    private UserResponseDto user;


    public AuthResponse(String message,boolean forcePasswordChange, UserResponseDto user) {
        this.message = message;
        this.forcePasswordChange = forcePasswordChange;
//        this.token = token;
        this.user = user;
    }

    // Getters and setters
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

//    public String getToken() {
//        return token;
//    }
//
//    public void setToken(String token) {
//        this.token = token;
//    }

    public UserResponseDto getUser() {
        return user;
    }

    public void setUser(UserResponseDto user) {
        this.user = user;
    }

    public boolean isForcePasswordChange() {
        return forcePasswordChange;
    }

    public void setForcePasswordChange(boolean forcePasswordChange) {
        this.forcePasswordChange = forcePasswordChange;
    }
}
