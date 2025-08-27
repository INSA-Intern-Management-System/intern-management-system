package com.example.notification_service.dto;

import com.example.notification_service.model.RecipientRole;

public class RecipientResponse {
    private Long id;
    private RecipientRole role;
    private boolean read;

    // Getters and setters

    public RecipientRole getRole() {
        return role;
    }

    public void setRole(RecipientRole role) {
        this.role = role;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}