package com.example.userservice.dto;

import java.util.Date;
import java.util.List;

public class ProjectDTO {

    private Long id;
    private String name;
    private String description;
    private Double progress;


    public ProjectDTO() {
    }

    public ProjectDTO(Long id, String name, String description,Double progress) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.progress=progress;
    }

    // Getters and setters...

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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getProgress(){
        return progress;
    }

    public void setProgress(Double progress){
        this.progress=progress;
    }

}

