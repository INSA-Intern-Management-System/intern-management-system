package com.example.report_service.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    // Relationships
    @ManyToOne
    @JoinColumn(name = "intern_id", nullable = false)
    private User intern;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne
    @JoinColumn(name = "manager_id", nullable = false)
    private User manager;

    // Fields
    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "period_to", nullable = false)
    private String periodTo;

    @Column(name = "task_completed", columnDefinition = "TEXT")
    private String taskCompleted;

    @Column(name = "challenges", columnDefinition = "TEXT")
    private String challenges;

    @Column(name = "next_week_goals")
    private String nextWeekGoals;

    @Column(name = "feedback_status", nullable = false, updatable = true)
    private Status feedbackStatus = Status.PENDING;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Constructors
    public Report() {}
    public Report(Long id) {
        this.id = id;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getIntern() { return intern; }
    public void setIntern(User intern) { this.intern = intern; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public User getManager() { return manager; }
    public void setManager(User manager) { this.manager = manager; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getPeriodTo() { return periodTo; }
    public void setPeriodTo(String periodTo) { this.periodTo = periodTo; }

    public String getTaskCompleted() { return taskCompleted; }
    public void setTaskCompleted(String taskCompleted) { this.taskCompleted = taskCompleted; }

    public String getChallenges() { return challenges; }
    public void setChallenges(String challenges) { this.challenges = challenges; }

    public String getNextWeekGoals() { return nextWeekGoals; }
    public void setNextWeekGoals(String nextWeekGoals) { this.nextWeekGoals = nextWeekGoals; }

    public Status getFeedbackStatus() { return feedbackStatus; }
    public void setFeedbackStatus(Status feedbackStatus) { this.feedbackStatus = feedbackStatus; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
