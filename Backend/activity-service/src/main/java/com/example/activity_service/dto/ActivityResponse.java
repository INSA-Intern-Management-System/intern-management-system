package com.example.activity_service.dto;

import java.time.LocalDateTime;

public class ActivityResponse {
    private Long id;
    private Long userId;
    private String title;
    private String description;
    private LocalDateTime createdAt;

    public ActivityResponse() {}

    public ActivityResponse(Long id, Long userId, String title, String description, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.description = description;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
