package com.example.message_service.dto;
import com.example.message_service.model.UserStatus;


public class UserResponseDTO {

    private Long    id;
    private String firstName;
    private String lastName;
    private String fieldOfStudy;
    private String university;
    private UserStatus Status;
    private String roleName;



    public UserResponseDTO () {}

    public UserResponseDTO(Long id, String firstName, String lastName,  String fieldOfStudy,
                String university,UserStatus status, String roleName) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.fieldOfStudy = fieldOfStudy;
        this.university = university;
        this.Status = status;
        this.roleName = roleName;
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

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getFieldOfStudy() {
        return fieldOfStudy;
    }

    public void setFieldOfStudy(String fieldOfStudy) {
        this.fieldOfStudy = fieldOfStudy;
    }

    public String getUniversity() {
        return university;
    }

    public void setUniversity(String university) {
        this.university = university;
    }

    public String getRole() {
        return roleName;
    }

    public void setRole(String role) {
        this.roleName = role;
    }

    public UserStatus getStatus() {
        return Status;
    }

    public void setStatus(UserStatus status) {
        Status = status;
    }
}

