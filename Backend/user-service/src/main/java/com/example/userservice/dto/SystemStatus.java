package com.example.userservice.dto;

public class SystemStatus {
    private String component;
    private String status;
    private String message;

    public SystemStatus(String component, String status, String message) {
        this.component = component;
        this.status = status;
        this.message = message;
    }

    public String getComponent() {
        return component;
    }

    public void setComponent(String component) {
        this.component = component;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
