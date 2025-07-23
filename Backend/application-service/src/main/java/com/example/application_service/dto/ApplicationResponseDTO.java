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
    private Long id;
    private ApplicationStatus status;
    private LocalDateTime createdAt;

    // Applicant details
    private ApplicantDTO applicant;

}
