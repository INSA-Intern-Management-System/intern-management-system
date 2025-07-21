package com.example.application_service.dto;

import jakarta.validation.constraints.NotNull;

public class ApplicationDTO {

    private Integer id;

    @NotNull
    private Integer applicantId;

    @Enumerated(EnumType.STRING)
    private ApplicationStatus status;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getApplicantId() {
        return applicantId;
    }

    public void setApplicantId(Integer applicantId) {
        this.applicantId = applicantId;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }

}
