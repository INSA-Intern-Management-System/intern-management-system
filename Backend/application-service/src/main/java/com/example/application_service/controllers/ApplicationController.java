package com.example.application_service.controllers;

import com.example.application_service.dto.ApplicantDTO;
import com.example.application_service.dto.ApplicationDTO;
import com.example.application_service.dto.ApplicationResponseDTO;
import com.example.application_service.dto.UserResponseDTO;
import com.example.application_service.model.Applicant;
import com.example.application_service.model.Application;
import com.example.application_service.model.ApplicationStatus;
import com.example.application_service.services.ApplicationService;
import com.example.application_service.services.UserServiceClient;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final UserServiceClient userServiceClient;

    public ApplicationController(ApplicationService applicationService, UserServiceClient userServiceClient) {
        this.applicationService = applicationService;
        this.userServiceClient = userServiceClient;
    }

    @PostMapping(value = "/applicant/create", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<?> createApplicant(
            @RequestHeader("Authorization") String token,
            @RequestPart("firstName") String firstName,
            @RequestPart("lastName") String lastName,
            @RequestPart("email") String email,
            @RequestPart(value = "phoneNumber", required = false) String phoneNumber,
            @RequestPart(value = "institution", required = false) String institution,
            @RequestPart(value = "fieldOfStudy", required = false) String fieldOfStudy,
            @RequestPart(value = "gender", required = false) String gender,
            @RequestPart(value = "duration", required = false) String duration,
            @RequestPart(value = "linkedInUrl", required = false) String linkedInUrl,
            @RequestPart(value = "githubUrl", required = false) String githubUrl,
            @RequestPart(value = "status", required = false) String status,
            @RequestPart(value = "cvFile", required = false) MultipartFile cvFile
    ) throws IOException {
        try {

            UserResponseDTO user = userServiceClient.validateToken(token);

            if (!"University".equals(user.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only universities can create applications.");
            }
            // Manually create ApplicantDTO
            ApplicantDTO applicantDTO = ApplicantDTO.builder()
                    .firstName(firstName)
                    .lastName(lastName)
                    .email(email)
                    .phoneNumber(phoneNumber)
                    .institution(institution)
                    .fieldOfStudy(fieldOfStudy)
                    .gender(gender)
                    .duration(duration)
                    .linkedInUrl(linkedInUrl)
                    .githubUrl(githubUrl)
                    .status(ApplicationStatus.valueOf(status != null ? status : "Pending"))  // default or convert properly

                    .build();

            ApplicantDTO created = applicationService.createApplicant(applicantDTO, cvFile);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Applicant created successfully");
            response.put("applicant", created);
            return ResponseEntity.status(201).body(response);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(400).body(error);
        }
    }


    @PostMapping(value = "/application/apply")
    public ResponseEntity<?> createApplication(
            @Valid @RequestBody ApplicationDTO dto,
            @RequestHeader("Authorization") String token) {
        try{

            UserResponseDTO user = userServiceClient.validateToken(token);

            if (!"University".equals(user.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only universities can create applications.");
            }

            ApplicationDTO created = applicationService.createApplication(dto);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Applied successfully");
            response.put("applicant", created);
            return ResponseEntity.status(201).body(response);
        }catch(RuntimeException e){

            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());

            return ResponseEntity.status(400).body(error);
        }
    }

    @GetMapping("/applications/all")
    public ResponseEntity<List<ApplicationResponseDTO>> getAllApplications() {
        List<Application> applications = applicationService.getAllApplications();

        List<ApplicationResponseDTO> response = applications.stream().map(application -> {
            Applicant applicant = application.getApplicant();
            return ApplicationResponseDTO.builder()
                    .applicationId(application.getId())
                    .status(application.getStatus())
                    .createdAt(application.getCreatedAt())
                    .firstName(applicant.getFirstName())
                    .lastName(applicant.getLastName())
                    .email(applicant.getEmail())
                    .insitution(applicant.getInstitution())
                    .fieldOfStudy(applicant.getFieldOfStudy())
                    .githubUrl(applicant.getGithubUrl())
                    .phoneNumber(applicant.getPhoneNumber())
                    .cvUrl(applicant.getCvUrl())
                    .build();
        }).toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/applications/applicant/{applicantId}")
    public ResponseEntity<List<ApplicationDTO>> getApplicationsByApplicantId(@PathVariable Long applicantId) {
        List<ApplicationDTO> application = applicationService.getApplicationByApplicantId(applicantId);
        return ResponseEntity.ok(application);
    }
}
