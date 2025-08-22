package com.example.userservice.model;


import jakarta.persistence.*;

@Entity
@Table(name = "system_settings")
public class SystemSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // General
    private String systemName;
    private String adminEmail;
    private String supportEmail;
    private String systemUrl;
    private String timeZone = "Europe/Paris";
    private String defaultLanguage = "English";
    private Boolean isMaintenanceMode = false;

    // Notifications
    private Boolean isEmailNotificationEnabled = true;

    // Security Settings
    private Integer minimumPasswordLength = 8;
    private Boolean requireSpecialCharacters = true;
    private Integer sessionTimeoutMinutes = 10;
    private Integer maxLoginAttempts = 5;
    private Integer failedAttempts = 0;
    private Boolean isAccountLocked = false;
    private String ipWhitelist; // comma-separated

    // Internship
    private Integer maxInterns;
    private Integer internshipDuration;
    private String reportFrequency = "Weekly";
    private Integer evaluationDeadline = 7;


    public Integer getFailedAttempts() {
        return failedAttempts;
    }

    public void setFailedAttempts(Integer failedAttempts) {
        this.failedAttempts = failedAttempts;
    }

    public Boolean getAccountLocked() {
        return isAccountLocked;
    }

    public void setAccountLocked(Boolean accountLocked) {
        isAccountLocked = accountLocked;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSystemName() {
        return systemName;
    }

    public Integer getMaxInterns() {
        return maxInterns;
    }

    public void setMaxInterns(Integer maxInterns) {
        this.maxInterns = maxInterns;
    }

    public Integer getInternshipDuration() {
        return internshipDuration;
    }

    public void setInternshipDuration(Integer internshipDuration) {
        this.internshipDuration = internshipDuration;
    }

    public String getReportFrequency() {
        return reportFrequency;
    }

    public void setReportFrequency(String reportFrequency) {
        this.reportFrequency = reportFrequency;
    }

    public Integer getEvaluationDeadline() {
        return evaluationDeadline;
    }

    public void setEvaluationDeadline(Integer evaluationDeadline) {
        this.evaluationDeadline = evaluationDeadline;
    }

    public void setSystemName(String systemName) {
        this.systemName = systemName;
    }

    public String getSupportEmail() {
        return supportEmail;
    }

    public void setSupportEmail(String supportEmail) {
        this.supportEmail = supportEmail;
    }

    public String getAdminEmail() {
        return adminEmail;
    }

    public void setAdminEmail(String adminEmail) {
        this.adminEmail = adminEmail;
    }

    public String getSystemUrl() {
        return systemUrl;
    }

    public void setSystemUrl(String systemUrl) {
        this.systemUrl = systemUrl;
    }

    public String getTimeZone() {
        return timeZone;
    }

    public void setTimeZone(String timeZone) {
        this.timeZone = timeZone;
    }

    public String getDefaultLanguage() {
        return defaultLanguage;
    }

    public void setDefaultLanguage(String defaultLanguage) {
        this.defaultLanguage = defaultLanguage;
    }

    public Boolean getMaintenanceMode() {
        return isMaintenanceMode;
    }

    public void setMaintenanceMode(Boolean isMaintenanceMode) {
        this.isMaintenanceMode = isMaintenanceMode;
    }

    public Boolean getEmailNotificationEnabled() {
        return isEmailNotificationEnabled;
    }

    public void setEmailNotificationEnabled(Boolean emailNotificationEnabled) {
        isEmailNotificationEnabled = emailNotificationEnabled;
    }

    public Integer getMinimumPasswordLength() {
        return minimumPasswordLength;
    }

    public void setMinimumPasswordLength(Integer minimumPasswordLength) {
        this.minimumPasswordLength = minimumPasswordLength;
    }

    public Boolean getRequireSpecialCharacters() {
        return requireSpecialCharacters;
    }

    public void setRequireSpecialCharacters(Boolean requireSpecialCharacters) {
        this.requireSpecialCharacters = requireSpecialCharacters;
    }

    public Integer getSessionTimeoutMinutes() {
        return sessionTimeoutMinutes;
    }

    public void setSessionTimeoutMinutes(Integer sessionTimeoutMinutes) {
        this.sessionTimeoutMinutes = sessionTimeoutMinutes;
    }

    public Integer getMaxLoginAttempts() {
        return maxLoginAttempts;
    }

    public void setMaxLoginAttempts(Integer maxLoginAttempts) {
        this.maxLoginAttempts = maxLoginAttempts;
    }

    public String getIpWhitelist() {
        return ipWhitelist;
    }

    public void setIpWhitelist(String ipWhitelist) {
        this.ipWhitelist = ipWhitelist;
    }
}

