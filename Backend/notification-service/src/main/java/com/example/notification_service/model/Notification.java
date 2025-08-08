package com.example.notification_service.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private NotificationType type = NotificationType.INFO; // ALERT, INFO, WARNING, SUCCESS

    @ElementCollection(targetClass = RecipientRole.class)
    @CollectionTable(name = "notification_roles", joinColumns = @JoinColumn(name = "notification_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private Set<RecipientRole> roles;

    private boolean is_read = false; // If you track read status globally

    @CreationTimestamp
    private LocalDateTime createdAt;

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }

    public Set<RecipientRole> getRoles() { return roles; }
    public void setRoles(Set<RecipientRole> roles) { this.roles = roles; }

    public boolean isRead() { return is_read; }
    public void setRead(boolean read) { this.is_read = is_read; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
