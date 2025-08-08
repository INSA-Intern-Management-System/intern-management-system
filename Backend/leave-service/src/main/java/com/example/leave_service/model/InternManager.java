package com.example.leave_service.model;

import jakarta.persistence.*;

@Entity
@Table(name = "intern_manager", uniqueConstraints = @UniqueConstraint(columnNames = "user_id"))
public class InternManager {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // One user has only one manager mapping
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    // Many users can have the same manager
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id", nullable = false)
    private User manager;

    public InternManager() {}

    public InternManager(User user, User manager) {
        this.user = user;
        this.manager = manager;
    }

    // Getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public User getManager() { return manager; }
    public void setManager(User manager) { this.manager = manager; }
}
