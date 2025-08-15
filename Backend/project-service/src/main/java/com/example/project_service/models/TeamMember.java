package com.example.project_service.models;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "team_members")
public class TeamMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    // Many members belong to one team
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    // Member user
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private User member;

    @Column(name = "role", nullable = false)
    private String role;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "joined_at")
    private Date joinedAt;

    public TeamMember() {
        this.joinedAt = new Date();
    }

    // Getters and setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Team getTeam() {
        return team;
    }

    public void setTeam(Team team) {
        this.team = team;
    }

    public User getMember() {
        return member;
    }

    public void setMember(User member) {
        this.member = member;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Date getJoinedAt() {
        return joinedAt;
    }
    
    public long setMemberId(Long memberId) {
        if (this.member == null) {
            this.member = new User();
        }
        this.member.setId(memberId);
        return memberId;
    }
    public long getMemberId() {
        return this.member != null ? this.member.getId() : null;
    }

    public void setJoinedAt(Date joinedAt) {
        this.joinedAt = joinedAt;
    }
}
