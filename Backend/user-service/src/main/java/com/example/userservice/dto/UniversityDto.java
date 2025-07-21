package com.example.userservice.dto;


import com.example.userservice.model.University;

public class UniversityDto {
    private Long    id;
    private String  name;
    private String email;
    private String  address;
    private String  description;

    public UniversityDto(University university) {
        this.id = university.getId();
        this.name = university.getName();
        this.email = university.getEmail();
        this.address = university.getAddress();
        this.description = university.getDescription();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
