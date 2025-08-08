package com.example.message_service.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "rooms") 
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // User1
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user1_id", nullable = false)
    private User user1;

    // User2
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user2_id", nullable = false)
    private User user2;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "last_message_at")
    private Date lastMessageAt;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created_at", nullable = false, updatable = false)
    private Date createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
    }

    @PreUpdate
    protected void onUpdate() {
        lastMessageAt = new Date();
    }

    // Constructors
    public Room() {}

    public Room(User user1, User user2) {
        this.user1 = user1;
        this.user2 = user2;
        this.lastMessageAt = new Date();
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser1() { return user1; }
    public void setUser1(User user1) { this.user1 = user1; }

    public User getUser2() { return user2; }
    public void setUser2(User user2) { this.user2 = user2; }

    public Date getLastMessageAt() { return lastMessageAt; }
    public void setLastMessageAt(Date lastMessageAt) { this.lastMessageAt = lastMessageAt; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
}
