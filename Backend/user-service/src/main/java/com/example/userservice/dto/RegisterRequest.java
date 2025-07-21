package com.example.userservice.dto;

import com.example.userservice.model.Role;
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
    public Boolean notifyEmail;
    public Boolean visibility;
    public String institution;
    public String linkedInUrl;
    public String githubUrl;
    public String cvUrl;
    public String profilePicUrl;
    public Date lastReadNotificationAt;

    @NotNull
    public Role role;
}

