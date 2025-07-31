package com.example.userservice.dto;

import lombok.Data;

import java.util.Date;

@Data
public class CompanyProfileDTO {

    // === Company Profile ===
    private String companyName;
    private String industry;
    private String companySize;
    private String address;
    private String website;
    private String companyDescription;

    // === Internship Program Settings ===
    private Integer maxInternsAllowed;
    private Integer minIntershipDuration;
    private Boolean isCVRequired;

    // === Notification Settings ===
    private Boolean notifyNewApplicationEnabled;
    private Boolean notifyWeeklyReportEnabled;
    private Boolean notifyLeaveRequestEnabled;

    // === Security Settings ===
    private Boolean twoFactorEnabled;

    private Date createdAt;
    private Date updatedAt;

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
    }

    public String getCompanySize() {
        return companySize;
    }

    public void setCompanySize(String companySize) {
        this.companySize = companySize;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCompanyDescription() {
        return companyDescription;
    }

    public void setCompanyDescription(String companyDescription) {
        this.companyDescription = companyDescription;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public Integer getMaxInternsAllowed() {
        return maxInternsAllowed;
    }

    public void setMaxInternsAllowed(Integer maxInternsAllowed) {
        this.maxInternsAllowed = maxInternsAllowed;
    }

    public Integer getMinIntershipDuration() {
        return minIntershipDuration;
    }

    public void setMinIntershipDuration(Integer minIntershipDuration) {
        this.minIntershipDuration = minIntershipDuration;
    }

    public Boolean getCVRequired() {
        return isCVRequired;
    }

    public void setCVRequired(Boolean CVRequired) {
        isCVRequired = CVRequired;
    }

    public Boolean getNotifyNewApplicationEnabled() {
        return notifyNewApplicationEnabled;
    }

    public void setNotifyNewApplicationEnabled(Boolean notifyNewApplicationEnabled) {
        this.notifyNewApplicationEnabled = notifyNewApplicationEnabled;
    }

    public Boolean getNotifyWeeklyReportEnabled() {
        return notifyWeeklyReportEnabled;
    }

    public void setNotifyWeeklyReportEnabled(Boolean notifyWeeklyReportEnabled) {
        this.notifyWeeklyReportEnabled = notifyWeeklyReportEnabled;
    }

    public Boolean getNotifyLeaveRequestEnabled() {
        return notifyLeaveRequestEnabled;
    }

    public void setNotifyLeaveRequestEnabled(Boolean notifyLeaveRequestEnabled) {
        this.notifyLeaveRequestEnabled = notifyLeaveRequestEnabled;
    }

    public Boolean getTwoFactorEnabled() {
        return twoFactorEnabled;
    }

    public void setTwoFactorEnabled(Boolean twoFactorEnabled) {
        this.twoFactorEnabled = twoFactorEnabled;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }
}
