package com.example.userservice.dto;

public class AdminResetPasswordRequest {
    public String targetUserEmail;
    public String newPassword;

    public AdminResetPasswordRequest() {
    }

    public AdminResetPasswordRequest(String targetUserEmail, String newPassword) {
        this.targetUserEmail = targetUserEmail;
        this.newPassword = newPassword;
    }

    public String getTargetUserEmail() {
        return targetUserEmail;
    }

    public void setTargetUserEmail(String targetUserEmail) {
        this.targetUserEmail = targetUserEmail;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
