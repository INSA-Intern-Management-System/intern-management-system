package com.example.userservice.dto;

public class RolesDTO {

    private Long id;  // Optional, you can omit this if not needed on client side

    private String name;  // e.g. "Student", "Admin", "HR", etc.

    private String displayName;  // Optional, user-friendly display name

    private String description;  // Optional

    // Constructors

    public RolesDTO() {}

    public RolesDTO(Long id, String name, String displayName, String description) {
        this.id = id;
        this.name = name;
        this.displayName = displayName;
        this.description = description;
    }

    // Getters and setters

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

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
