package com.example.notification_service.dto;

import com.example.notification_service.model.NotificationType;
import com.example.notification_service.model.RecipientRole;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Set;

public class NotificationRequest {
    private String title;
    private String description;

    @JsonProperty("roles") // this must match JSON key
    private Set<RecipientRole> roles;

    private NotificationType notificationType = NotificationType.INFO;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Set<RecipientRole> getRoles() { return roles; }
    public void setRoles(Set<RecipientRole> roles) { this.roles = roles; }

    public NotificationType getNotificationType() { return notificationType; }
    public void setNotificationType(NotificationType notificationType) { this.notificationType = notificationType; }
}
