package com.example.userservice.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "verification_codes")
public class VerificationCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code; // The HASHED OTP string

    @ManyToOne // One user can have multiple codes, but you'll manage active codes in service
    @JoinColumn(nullable = false, name = "user_id")
    private User user;

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    @Column(nullable = false)
    private boolean used = false; // To prevent replay attacks

    // ✅ Removed: CodeType enum and 'type' field

    public VerificationCode() {}

    // ✅ Constructor updated: removed CodeType parameter
    public VerificationCode(String code, User user, LocalDateTime expiryDate) {
        this.code = code;
        this.user = user;
        this.expiryDate = expiryDate;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public LocalDateTime getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDateTime expiryDate) { this.expiryDate = expiryDate; }
    public boolean isUsed() { return used; }
    public void setUsed(boolean used) { this.used = used; }
    // ✅ Removed: getType() and setType()

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryDate);
    }
}