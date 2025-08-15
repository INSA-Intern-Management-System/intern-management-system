package com.example.schedule_service.model;
import jakarta.persistence.*;
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long    id;

    public User () {}
    public User(Long id) {
        this.id = id;
    }
    public Long getUserId() {
        return id;
    }
    public void setUserId(Long id) {
        this.id = id;
    }

}

