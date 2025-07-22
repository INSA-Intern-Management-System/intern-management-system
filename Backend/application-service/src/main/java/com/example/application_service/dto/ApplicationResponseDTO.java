package com.example.application_service.dto;

import com.example.application_service.model.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class ApplicationResponseDTO {
    private Long applicationId;
    private ApplicationStatus status;
    private LocalDateTime createdAt;

    // Applicant details
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String cvUrl;
    private String insitution;
    private String fieldOfStudy;
    private String githubUrl;

}
