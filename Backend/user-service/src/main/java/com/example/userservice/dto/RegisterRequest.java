package com.example.userservice.dto;

import com.example.userservice.model.Role;
import com.example.userservice.model.Role;
import com.example.userservice.model.UserStatus;
import jakarta.validation.constraints.NotNull;

import java.util.Date;

public class RegisterRequest {
    public String firstName;
    public String lastName;
    public String email;
    public String password;
    public String phoneNumber;
    public String address;
    public String gender;
    public String fieldOfStudy;
    public String duration;
    public String bio;
    public Boolean notifyEmail = true;
    public Boolean visibility = true;
    public String institution;
    public String linkedInUrl;
    public String githubUrl;
    public String cvUrl;
    public String profilePicUrl;
    public Date lastReadNotificationAt;

    @NotNull
    public Role role;
    public UserStatus userStatus;

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public UserStatus getUserStatus() {
        return userStatus;
    }

    public void setUserStatus(UserStatus userStatus) {
        this.userStatus = userStatus;
    }


}

