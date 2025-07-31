package com.example.activity_service.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "activities")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    private String description;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt; // Maps directly to timestamp in PostgreSQL

    // You might add an 'activity_type' field if you want to categorize activities beyond 'title'
    // private String activityType;
}