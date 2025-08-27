package com.example.notification_service.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
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

//    private boolean is_read = false;

    @OneToMany(mappedBy = "notification", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<NotificationRecipients> recipients = new ArrayList<>();

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

    public List<NotificationRecipients> getRecipients() { return recipients; }
    public void setRecipients(List<NotificationRecipients> recipients) { this.recipients = recipients; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
