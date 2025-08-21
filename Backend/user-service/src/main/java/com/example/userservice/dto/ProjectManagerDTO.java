package com.example.userservice.dto;

import com.example.userservice.model.User;

public class ProjectManagerDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String fieldOfStudy;
    private String institution;

    public ProjectManagerDTO(User projectManager) {
        this.id = projectManager.getId();
        this.firstName = projectManager.getFirstName();
        this.lastName = projectManager.getLastName();
        this.email = projectManager.getEmail();
        this.fieldOfStudy = projectManager.getFieldOfStudy();
        this.institution = projectManager.getInstitution();
    }
    // getters and setters


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
}