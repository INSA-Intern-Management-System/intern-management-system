package com.example.userservice.dto;

public class InternManagerRequestDTO {
    private Long userId;

    public InternManagerRequestDTO() {
    }

    public InternManagerRequestDTO(Long userId) {
        this.userId = userId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
