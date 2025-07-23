package com.example.application_service.controllers;

import com.example.application_service.dto.ApplicantDTO;
import com.example.application_service.dto.ApplicationDTO;
import com.example.application_service.dto.ApplicationResponseDTO;
import com.example.application_service.dto.UserResponseDTO;
import com.example.application_service.model.Applicant;
import com.example.application_service.model.Application;
import com.example.application_service.model.ApplicationStatus;
import com.example.application_service.repository.ApplicantRepository;
import com.example.application_service.repository.ApplicationRepository;
import com.example.application_service.services.ApplicationService;
import com.example.application_service.services.UserServiceClient;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
    private final ApplicantRepository applicantRepository;
    private final ApplicationRepository applicationRepository;

    public ApplicationController(ApplicationService applicationService, UserServiceClient userServiceClient, ApplicantRepository applicantRepository, ApplicationRepository applicationRepository) {
        this.applicationService = applicationService;
        this.userServiceClient = userServiceClient;
        this.applicantRepository = applicantRepository;
        this.applicationRepository = applicationRepository;
    }

    @PostMapping(value = "/applicant/create", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<?> createApplicant(
            HttpServletRequest request,
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

            String role = (String) request.getAttribute("role");

            if (!"University".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized: Only University can create application");
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
            response.put("message", "Application created successfully");
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
            HttpServletRequest request,
            @Valid @RequestBody ApplicationDTO dto
            ) {
        try{
            String role = (String) request.getAttribute("role");

            if (!"University".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized: Only University can create application");
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

            ApplicantDTO applicantDTO = ApplicantDTO.builder()
                    .id(applicant.getId())
                    .firstName(applicant.getFirstName())
                    .lastName(applicant.getLastName())
                    .email(applicant.getEmail())
                    .phoneNumber(applicant.getPhoneNumber())
                    .gender(applicant.getGender())
                    .duration(applicant.getDuration())
                    .cvUrl(applicant.getCvUrl())
                    .institution(applicant.getInstitution())
                    .fieldOfStudy(applicant.getFieldOfStudy())
                    .githubUrl(applicant.getGithubUrl())
                    .linkedInUrl(applicant.getLinkedInUrl())
                    .status(applicant.getStatus())
                    .createdAt(applicant.getCreatedAt())
                    .build();

            return ApplicationResponseDTO.builder()
                    .id(application.getId())
                    .status(application.getStatus())
                    .createdAt(application.getCreatedAt())
                    .applicant(applicantDTO)
                    .build();
        }).toList();

        return ResponseEntity.ok(response);
    }


    @GetMapping("/applications/applicant/{applicantId}")
    public ResponseEntity<List<ApplicationDTO>> getApplicationsByApplicantId(@PathVariable Long applicantId) {
        List<ApplicationDTO> application = applicationService.getApplicationByApplicantId(applicantId);
        return ResponseEntity.ok(application);
    }

    private ResponseEntity<?> errorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    @PostMapping(value = "/application/batch", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> batchImport(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {

        try {
            String role = (String) request.getAttribute("role");

            if (!"University".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized: Only University can create batch application");
            }

            List<ApplicantDTO> savedApplicants = applicationService.batchApplication(file);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Batch import created successfully");
            response.put("applicants", savedApplicants);

            return ResponseEntity.status(201).body(response);

        } catch (RuntimeException | IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(400).body(error);
        }
    }


    @PutMapping("/applications/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestParam("status") String status,
            HttpServletRequest request )
    {
        try {
            String role = (String) request.getAttribute("role");

            if (!"HR".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized: Only HR can Update status of application");
            }

            ApplicationDTO updated = applicationService.updateApplicationStatus(id, ApplicationStatus.valueOf(status));
            return ResponseEntity.ok(updated);

        }catch(RuntimeException e){
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(400).body(error);

        }
    }

    @GetMapping("/applicants/search")
    public ResponseEntity<?> searchApplicants(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {

        String role = (String) request.getAttribute("role");

        if (!"HR".equalsIgnoreCase(role) && !"Project_Manager".equalsIgnoreCase(role)) {
            return errorResponse("Unauthorized: Only HR or Project Manager can search applicants");
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Application> applicationsPage = applicationRepository.searchApplicationsByApplicant(query, pageable);

        List<ApplicationResponseDTO> content = applicationsPage.getContent()
                .stream()
                .map(this::mapToDTO)
                .toList();

        return ResponseEntity.ok(Map.of(
                "content", content,
                "currentPage", applicationsPage.getNumber(),
                "totalPages", applicationsPage.getTotalPages(),
                "totalElements", applicationsPage.getTotalElements()
        ));
    }


    @GetMapping("/applications/filter/status")
    public ResponseEntity<?> filterByStatus(@RequestParam("status") String status, HttpServletRequest request) {
        String role = (String) request.getAttribute("role");

        if (!"HR".equalsIgnoreCase(role) && !"Project_Manager".equalsIgnoreCase(role)) {
            return errorResponse("Unauthorized: Only HR or Project Manager can search applicants");
        }
        List<Application> applications = applicationRepository.filterByStatus(ApplicationStatus.valueOf(status));
        List<ApplicationResponseDTO> response = applications.stream()
                .map(this::mapToDTO)
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/applications/filter/position")
    public ResponseEntity<?> filterByPosition(@RequestParam("position") String position, HttpServletRequest request) {

        String role = (String) request.getAttribute("role");

        if (!"HR".equalsIgnoreCase(role) && !"Project_Manager".equalsIgnoreCase(role)) {
            return errorResponse("Unauthorized: Only HR or Project Manager can search applicants");
        }

        List<Application> applications = applicationRepository.filterByPosition(position);
        List<ApplicationResponseDTO> response = applications.stream()
                .map(this::mapToDTO)
                .toList();

        return ResponseEntity.ok(response);
    }


    @GetMapping("/applications/filter/university")
    public ResponseEntity<?> filterByUniversity(@RequestParam("university") String university, HttpServletRequest request) {

        String role = (String) request.getAttribute("role");

        if (!"HR".equalsIgnoreCase(role) && !"Project_Manager".equalsIgnoreCase(role)) {
            return errorResponse("Unauthorized: Only HR or Project Manager can search applicants");
        }

        List<Application> applications = applicationRepository.filterByUniversity(university);
        List<ApplicationResponseDTO> response = applications.stream()
                .map(this::mapToDTO)
                .toList();

        return ResponseEntity.ok(response);
    }


    private ApplicationResponseDTO mapToDTO(Application application) {
        return ApplicationResponseDTO.builder()
                .id(application.getId())
                .status(application.getStatus())
                .createdAt(application.getCreatedAt())
                .applicant(
                        ApplicantDTO.builder()
                                .id(application.getApplicant().getId())
                                .firstName(application.getApplicant().getFirstName())
                                .lastName(application.getApplicant().getLastName())
                                .email(application.getApplicant().getEmail())
                                .phoneNumber(application.getApplicant().getPhoneNumber())
                                .institution(application.getApplicant().getInstitution())
                                .fieldOfStudy(application.getApplicant().getFieldOfStudy())
                                .gender(application.getApplicant().getGender())
                                .duration(application.getApplicant().getDuration())
                                .linkedInUrl(application.getApplicant().getLinkedInUrl())
                                .githubUrl(application.getApplicant().getGithubUrl())
                                .cvUrl(application.getApplicant().getCvUrl())
                                .createdAt(application.getApplicant().getCreatedAt())
                                .status(application.getApplicant().getStatus())
                                .build()
                )
                .build();
    }

}




