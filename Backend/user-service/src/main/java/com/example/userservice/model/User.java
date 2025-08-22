package com.example.userservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.List;


@Entity
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long    id;

    private String firstName;
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String phoneNumber;
    private String address;
    private String gender;
    private String fieldOfStudy;
    private String institution;
    private String bio;
    private Boolean notifyEmail;
    private Boolean visibility;
    private String duration;
    private String linkedInUrl;
    private String githubUrl;
    private String cvUrl;
    private String profilePicUrl;
    private Date lastReadNotificationAt;
    private Date createdAt;
    private Date updatedAt;

    @Column(name = "failed_attempts")
    private Integer failedAttempts = 0;
    @Column(name = "account_locked")
    private Boolean isAccountLocked = false;
    @Column(name = "account_locked_at")
    private LocalDateTime accountLockedAt;

    @ManyToOne
    @JoinColumn(name = "supervisor_id")
    private User supervisor;

    @OneToMany(mappedBy = "supervisor")
    private List<User> supervisedInterns;

    @ManyToOne
    @JoinColumn(name = "project_manager_id")
    private User projectManager;

    @OneToMany(mappedBy = "projectManager")
    private List<User> projectManagerInterns;


    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "last_login")
    private Date lastLogin;

    @Column(nullable = false) // Assuming it should always have a value
    private Boolean isFirstLogin = true; // Initialize to true for new users



//    @NotNull
//    @Column(nullable = false)
//    @Enumerated(EnumType.STRING)
//    private Role role;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private UserStatus userStatus = UserStatus.PENDING;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Status status = Status.OFFLINE; // Default status

    public Date getLastLogin() {
        return lastLogin;
    }
    public void setLastLogin(Date lastLogin) {
        this.lastLogin = lastLogin;
    }



    public User() {
    }

    public User(Long id) {
        this.id = id;
        this.status = Status.OFFLINE;
    }



    public User(
    Long id, 
    String firstName, 
    String lastName,
    String email,
    String password,
    String phoneNumber,
    String address, 
    String gender, 
    String fieldOfStudy,
    String institution, 
    String bio,
    Boolean notifyEmail,
    Boolean visibility,
    String duration,
    String linkedInUrl,
    String githubUrl,
    String cvUrl,
    String profilePicUrl,
    Date lastReadNotificationAt,
    Date lastLogin,
    Role role,
    UserStatus userStatus,
    Status status,
    Date createdAt, 
    Date updatedAt,
    Boolean isFirstLogin,
    User supervisor,
    List<User> supervisedInterns,
    User projectManager,
    List<User> projectManagerInterns,
    Integer failedAttempts,
    Boolean isAccountLocked,
    LocalDateTime accountLockedAt

      ) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.gender = gender;
        this.fieldOfStudy = fieldOfStudy;
        this.institution = institution;
        this.bio = bio;
        this.notifyEmail = notifyEmail;
        this.visibility = visibility;
        this.duration = duration;
        this.linkedInUrl = linkedInUrl;
        this.githubUrl = githubUrl;
        this.cvUrl = cvUrl;
        this.profilePicUrl = profilePicUrl;
        this.lastReadNotificationAt = lastReadNotificationAt;
        this.lastLogin = lastLogin;
        this.role = role;
        this.userStatus = userStatus;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.isFirstLogin = isFirstLogin;
        this.supervisor = supervisor;
        this.supervisedInterns = supervisedInterns;
        this.projectManager = projectManager;
        this.projectManagerInterns = projectManagerInterns;
        this.failedAttempts = failedAttempts;
        this.isAccountLocked = isAccountLocked;
        this.accountLockedAt = accountLockedAt;
    }

     @Override
     public Collection<? extends GrantedAuthority> getAuthorities() {
         // You can use role-based authority here
         return Collections.emptyList(); // Or use: List.of(new SimpleGrantedAuthority(role))
     }

     @Override
     public String getUsername() {
         return email;
     }

     @Override
     public boolean isAccountNonExpired() {
         return true;
     }

     @Override
     public boolean isAccountNonLocked() {
         return true;
     }

     @Override
     public boolean isCredentialsNonExpired() {
         return true;
     }

     @Override
     public boolean isEnabled() {
         return true;
     }


    public Boolean isFirstLogin() {
        return isFirstLogin;
    }

    public void setFirstLogin(Boolean firstLogin) {
        isFirstLogin = firstLogin;
    }
    

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getSupervisor() {
        return supervisor;
    }

    public void setSupervisor(User supervisor) {
        this.supervisor = supervisor;
    }

    public List<User> getSupervisedInterns() {
        return supervisedInterns;
    }

    public void setSupervisedInterns(List<User> supervisedInterns) {
        this.supervisedInterns = supervisedInterns;
    }

    public User getProjectManager() {
        return projectManager;
    }

    public void setProjectManager(User projectManager) {
        this.projectManager = projectManager;
    }

    public List<User> getProjectManagerInterns() {
        return projectManagerInterns;
    }

    public void setProjectManagerInterns(List<User> projectManagerInterns) {
        this.projectManagerInterns = projectManagerInterns;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getFieldOfStudy() {
        return fieldOfStudy;
    }

    public void setFieldOfStudy(String fieldOfStudy) {
        this.fieldOfStudy = fieldOfStudy;
    }

    public String getInstitution() {
        return institution;
    }

    public void setInstitution(String institution) {
        this.institution = institution;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

     public Boolean getNotifyEmail() {
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

     public String getLinkedInUrl() {
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

    public Status getStatus() {
        return status;
    }
    public void setStatus(Status status) {
        this.status = status;
    }

    public Integer getFailedAttempts() {
        return failedAttempts;
    }

    public void setFailedAttempts(Integer failedAttempts) {
        this.failedAttempts = failedAttempts;
    }

    public Boolean getAccountLocked() {
        return isAccountLocked;
    }
    public void setAccountLocked(Boolean isAccountLocked){
        this.isAccountLocked = isAccountLocked;
    }
    public LocalDateTime getAccountLockedAt() { return accountLockedAt; }
    public void setAccountLockedAt(LocalDateTime accountLockedAt) { this.accountLockedAt = accountLockedAt; }
}
