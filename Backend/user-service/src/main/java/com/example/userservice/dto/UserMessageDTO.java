package com.example.userservice.dto;

import com.example.userservice.model.Role;

import com.example.userservice.model.Status;


public class UserMessageDTO {

    private Long    id;
    private String firstName;
    private String lastName;
    private String fieldOfStudy;
    private String university;
    private Status Status;
    private Role role;



    public UserMessageDTO () {}

    public UserMessageDTO(Long id, String firstName, String lastName,  String fieldOfStudy,
                String university,Status status, Role role) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.fieldOfStudy = fieldOfStudy;
        this.university = university;
        this.Status = status;
        this.role = role;
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

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Status getStatus() {
        return Status;
    }

    public void setStatus(Status status) {
        Status = status;
    }
}

