package com.example.userservice.dto;

import com.example.userservice.model.User;
import java.util.List;

public class SupervisorDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String fieldOfStudy;
    private String institution;
    private String phoneNumber;
    private List<User> supervisedInterns;

    public SupervisorDTO(User supervisor) {
        this.id = supervisor.getId();
        this.firstName = supervisor.getFirstName();
        this.lastName = supervisor.getLastName();
        this.email = supervisor.getEmail();
        this.fieldOfStudy = supervisor.getFieldOfStudy();
        this.institution = supervisor.getInstitution();
        this.phoneNumber = supervisor.getPhoneNumber();
    }

    // Getters and Setters
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

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public List<User> getSupervisedInterns() {
        return supervisedInterns;
    }

    public void setSupervisedInterns(List<User> supervisedInterns) {
        this.supervisedInterns = supervisedInterns;
    }
}
