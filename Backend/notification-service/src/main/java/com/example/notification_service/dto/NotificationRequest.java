package com.example.notification_service.dto;

import com.example.notification_service.model.NotificationType;
import com.example.notification_service.model.RecipientRole;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.Set;

public class NotificationRequest {
    private String title;
    private String description;

    @JsonProperty("recipientRole")
    private Set<RecipientRole> roles;
    private NotificationType notificationType = NotificationType.INFO;
    private Boolean is_read = false;


    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public NotificationType getNotificationType() {
        return notificationType;
    }

    public void setNotificationType(NotificationType notificationType) {
        this.notificationType = notificationType;
    }

    public Boolean getIs_read() {
        return is_read;
    }

    public void setIs_read(Boolean is_read) {
        this.is_read = is_read;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Set<RecipientRole> getRoles() { return roles; }
    public void setRoles(Set<RecipientRole> roles) { this.roles = roles; }

}