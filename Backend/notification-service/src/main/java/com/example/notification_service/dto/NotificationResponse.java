package com.example.notification_service.dto;

import com.example.notification_service.model.NotificationType;
import com.example.notification_service.model.RecipientRole;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

public class NotificationResponse {
    private Long id;
    private String title;
    private String description;
    private NotificationType type;
    private Set<RecipientRole> roles;
    private LocalDateTime createdAt;
    private List<RecipientResponse> recipients;

    // Getters and setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public NotificationType getType() {
        return type;
    }

    public void setType(NotificationType type) {
        this.type = type;
    }

    public Set<RecipientRole> getRoles() {
        return roles;
    }

    public void setRoles(Set<RecipientRole> roles) {
        this.roles = roles;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<RecipientResponse> getRecipients() {
        return recipients;
    }

    public void setRecipients(List<RecipientResponse> recipients) {
        this.recipients = recipients;
    }
}