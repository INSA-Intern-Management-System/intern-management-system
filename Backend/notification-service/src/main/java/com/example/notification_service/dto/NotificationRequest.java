package com.example.notification_service.dto;

import com.example.notification_service.model.RecipientRole;

import java.time.LocalDateTime;

public class NotificationRequest {
    private String title;
    private String description;
    private RecipientRole recipientRole;


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

    public RecipientRole getRecipientRole() {
        return recipientRole;
    }

    public void setRecipientRole(RecipientRole recipientRole) {
        this.recipientRole = recipientRole;
    }

}