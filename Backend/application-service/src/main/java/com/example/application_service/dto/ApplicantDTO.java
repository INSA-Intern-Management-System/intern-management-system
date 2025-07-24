package com.example.application_service.dto;

import com.example.application_service.model.ApplicationStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicantDTO {

    private Long id;

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @Email
    @NotBlank
    private String email;

    private String phoneNumber;
    private String institution;
    private String fieldOfStudy;
    private String gender;
    private String duration;
    private String linkedInUrl;
    private String githubUrl;
    private String cvUrl;

    private LocalDateTime createdAt;

}
