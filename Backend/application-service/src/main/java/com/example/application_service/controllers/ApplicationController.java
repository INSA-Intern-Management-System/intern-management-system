package com.example.application_service.controllers;

import com.example.application_service.dto.ApplicantDTO;
import com.example.application_service.dto.ApplicationDTO;
import com.example.application_service.services.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping(value = "/applicants", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<ApplicantDTO> createApplicant(@Valid @RequestPart("applicant") ApplicantDTO applicantDTO,
                                                        @RequestPart(value = "cvFile", required = false) MultipartFile cvFile) throws IOException {
        ApplicantDTO created = applicationService.createApplicant(applicantDTO, cvFile);
        return ResponseEntity.ok(created);
    }

    @PostMapping("/applications")
    public ResponseEntity<ApplicationDTO> createApplication(@Valid @RequestBody ApplicationDTO applicationDTO) {
        ApplicationDTO created = applicationService.createApplication(applicationDTO);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/applicants/user/{userId}")
    public ResponseEntity<ApplicantDTO> getApplicantByUserId(@PathVariable Integer userId) {
        return applicationService.getApplicantByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/applications/applicant/{applicantId}")
    public ResponseEntity<List<ApplicationDTO>> getApplicationsByApplicantId(@PathVariable Integer applicantId) {
        return ResponseEntity.ok(applicationService.getApplicationsByApplicantId(applicantId));
    }
}
