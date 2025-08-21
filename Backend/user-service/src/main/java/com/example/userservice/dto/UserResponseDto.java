package com.example.userservice.dto;

import com.example.userservice.model.Role;
import com.example.userservice.model.Role;
import com.example.userservice.model.User;
import com.example.userservice.model.UserStatus;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;
import java.util.Date;

public class UserResponseDto {

    private Long id;
    private String firstName;
    private String lastName;

    @NotBlank(message = "Email is required")
    private String email;

    private String phoneNumber;
    private String address;
    private String gender;
    private Boolean notifyEmail;
    private Boolean visibility;
    private String bio;
    private String duration;
    private String linkedInUrl;
    private String githubUrl;
    private String cvUrl;
    private String profilePicUrl;
    private Date lastReadNotificationAt;
    private Date createdAt;
    private Date updatedAt;
    private String fieldOfStudy;
    private String institution;
    private LocalDateTime lastLogin;
    private SupervisorDTO supervisor;
    private ProjectManagerDTO projectManager;

    @NotBlank(message = "Role is required")
    private Role role;

    private UserStatus userStatus;

    public UserResponseDto(User user) {
        this.id = user.getId();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.email = user.getEmail();
        this.phoneNumber = user.getPhoneNumber();
        this.address = user.getAddress();
        this.gender = user.getGender();
        this.bio = user.getBio();
        this.notifyEmail = user.getNotifyEmail();
        this.visibility = user.getVisibility();
        this.duration = user.getDuration();
        this.linkedInUrl = user.getLinkedInUrl();
        this.lastReadNotificationAt = user.getLastReadNotificationAt();
        this.githubUrl = user.getGithubUrl();
        this.cvUrl = user.getCvUrl();
        this.profilePicUrl = user.getProfilePicUrl();
        this.fieldOfStudy = user.getFieldOfStudy();
        this.institution = user.getInstitution();
        this.createdAt = user.getCreatedAt();
        this.updatedAt = user.getUpdatedAt();
        this.role = user.getRole();
        this.userStatus = user.getUserStatus();

        if (user.getSupervisor() != null) {
            this.supervisor = new SupervisorDTO(user.getSupervisor());
        }

        if (user.getProjectManager() != null) {
            this.projectManager = new ProjectManagerDTO(user.getProjectManager());
        }

    }

    // Getters and Setters (generate with Alt+Insert or Lombok)



    public Boolean getNotifyEmail() {
        return notifyEmail;
    }

    public SupervisorDTO getSupervisor() {
        return supervisor;
    }

    public void setSupervisor(SupervisorDTO supervisor) {
        this.supervisor = supervisor;
    }

    public ProjectManagerDTO getProjectManager() {
        return projectManager;
    }

    public void setProjectManager(ProjectManagerDTO supervisor) {
        this.projectManager = projectManager;
    }


    public String getLinkedInUrl() {
        return linkedInUrl;
    }

    public LocalDateTime getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(LocalDateTime lastLogin) {
        this.lastLogin = lastLogin;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getFieldOfStudy() {
        return fieldOfStudy;
    }

    public void setFieldOfStudy(String fieldOfStudy) {
        this.fieldOfStudy = fieldOfStudy;
    }

    public void setInstitution(String institution){
      this.institution = institution;
    }

    public String getInstitution() {
        return institution;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

     public Boolean notifyEmail() {
        return notifyEmail;
    }

    public void setNotifyEmail(Boolean notifyEmail) {
        this.notifyEmail = notifyEmail;
    }

     public Boolean getVisibility() {
        return visibility;
    }

    public void setVisibility(Boolean visibility) {
        this.visibility = visibility;
    }

     public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

     public String linkedInUrl() {
        return linkedInUrl;
    }

    public void setLinkedInUrl(String linkedInUrl) {
        this.linkedInUrl = linkedInUrl;
    }
    
     public String getGithubUrl() {
        return githubUrl;
    }

    public void setGithubUrl(String githubUrl) {
        this.githubUrl = githubUrl;
    }

     public String getCvUrl() {
        return cvUrl;
    }

    public void setCvUrl(String cvUrl) {
        this.cvUrl = cvUrl;
    }

     public String getProfilePicUrl() {
        return profilePicUrl;
    }

    public void setProfilePicUrl(String profilePicUrl) {
        this.profilePicUrl = profilePicUrl;
    }

     public Date getLastReadNotificationAt() {
        return lastReadNotificationAt;
    }

    public void setLastReadNotificationAt(Date lastReadNotificationAt ) {
        this.lastReadNotificationAt = lastReadNotificationAt;
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
    
    public Role getRoles() {
        return role;
    }
    public void setRoles(Role role) {
        this.role = role;
    }


    public UserStatus getUserStatus() {
        return userStatus;
    }
    public void setUserStatus(UserStatus userStatus) {
        this.userStatus = userStatus;
    }


}
