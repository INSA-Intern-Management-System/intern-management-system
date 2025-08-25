package com.example.application_service.controllers;

import com.example.application_service.dto.ApplicantDTO;
import com.example.application_service.gRPC.NotificationGrpcClient;
import com.example.application_service.dto.ApplicationDTO;
import com.example.application_service.dto.ApplicationResponseDTO;
import com.example.application_service.dto.UserResponseDTO;
import com.example.application_service.gRPC.UserServiceClient;
import com.example.application_service.model.Applicant;
import com.example.application_service.model.Application;
import com.example.application_service.model.ApplicationStatus;
import com.example.application_service.repository.ApplicantRepository;
import com.example.application_service.repository.ApplicationRepository;
import com.example.application_service.security.JwtUtil;
import com.example.application_service.services.ApplicationService;
import com.example.grpc.NotificationType;
import com.example.grpc.RecipientRole;
import com.example.userservice.gRPC.MaxInternRequest;
import com.example.userservice.gRPC.MaxInternResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.*;


@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api")
public class ApplicationController {

    private final ApplicationService applicationService;
//    private final UserServiceClient userServiceClient;
    private final ApplicantRepository applicantRepository;
    private final ApplicationRepository applicationRepository;
    private final JwtUtil jwtUtil;

    @Autowired
    private NotificationGrpcClient notificationGrpcClient;

    @Autowired
    private UserServiceClient userServiceClient;




    public ApplicationController(ApplicationService applicationService,
                                 ApplicantRepository applicantRepository,
                                 JwtUtil jwtUtil,
                                 UserServiceClient userServiceClient,
                                 ApplicationRepository applicationRepository,
                                 NotificationGrpcClient notificationGrpcClient
                                 ) {
        this.applicationService = applicationService;
        this.userServiceClient = userServiceClient;
        this.applicantRepository = applicantRepository;
        this.applicationRepository = applicationRepository;
        this.notificationGrpcClient = notificationGrpcClient;
        this.jwtUtil = jwtUtil;
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

            Application created = applicationService.createApplication(dto);

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


    @PostMapping(value = "/apply", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> apply(
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
            @RequestPart(value = "cvFile", required = false) MultipartFile cvFile
    ) throws IOException {

        String token = null;
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("access_token".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }
        if (token == null) {
            return ResponseEntity.status(401).body("Missing access_token cookie");
        }

        String role = (String) request.getAttribute("role");
        if (!"UNIVERSITY".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("message", "Unauthorized: Only University can apply"));
        }


        // ✅ Check if application limit is reached
        MaxInternResponse maxInternResponse = userServiceClient.getMaxIntern(MaxInternRequest.newBuilder().build(), token);
        int maxIntern = maxInternResponse.getMaxIntern();

        long currentApplications = applicantRepository.count();

        if (currentApplications >= maxIntern) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("message", "Application limit reached. No more interns can be added."));
        }

        // ✅ Check if email already exists
        Optional<Applicant> existingApplicant = applicantRepository.findByEmail(email);
        if (existingApplicant.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Collections.singletonMap("message", "An applicant with this email already applied."));
        }


        // ✅ Create new Applicant DTO
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
                .build();

        // ✅ Save the applicant (with CV file) and application
        ApplicantDTO savedApplicant = applicationService.createApplicant(applicantDTO, cvFile);

        ApplicationDTO applicationDTO = new ApplicationDTO();
        applicationDTO.setApplicantId(savedApplicant.getId());
        applicationDTO.setStatus(ApplicationStatus.Pending);

        Application createdApplication = applicationService.createApplication(applicationDTO);

        // ✅ Use mapToDTO to convert to response DTO
        ApplicationResponseDTO responseDTO = mapToDTO(createdApplication);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Applied successfully");
        response.put("application", responseDTO);

//         Send notification to UNIVERSITY and COMPANY (example)
        String message = String.format(
                "A new internship application has been submitted by student %s %s (%s) from %s in the field of %s.",
                createdApplication.getApplicant().getFirstName(),
                createdApplication.getApplicant().getLastName(),
                createdApplication.getApplicant().getEmail(),
                (createdApplication.getApplicant().getInstitution() != null ? createdApplication.getApplicant().getInstitution() : "N/A"),
                (createdApplication.getApplicant().getFieldOfStudy() != null ? createdApplication.getApplicant().getFieldOfStudy() : "N/A")
        );

         notificationGrpcClient.sendNotification(
                 Set.of(RecipientRole.HR), //
                 "New Internship Application Submitted",
                 message,
                 Instant.now(),
                 NotificationType.SUCCESS
         );

        return ResponseEntity.status(201).body(response);
    }


    @GetMapping("/applications/all")
    public ResponseEntity<?> getAllApplications(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
            ) {


        try{
            // 🔑 Get JWT from cookie
            String token = null;
            if (request.getCookies() != null) {
                for (Cookie cookie : request.getCookies()) {
                    if ("access_token".equals(cookie.getName())) { // <-- replace "token" with your cookie name
                        token = cookie.getValue();
                        break;
                    }
                }
            }
            if (token == null) {
                return ResponseEntity.status(401).body("Missing access_token cookie");
            }
            // 🔑 Extract role & id from token
            String role = jwtUtil.extractUserRole(token);

            if (!"HR".equalsIgnoreCase(role) ) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Only HR can access this resource"));
            }

            Pageable pageable = PageRequest.of(page, size);
            Page<Application> applicationsPage = applicationService.getAllApplications(pageable);

            Page<ApplicationResponseDTO> responsePage = applicationsPage.map(this::mapToDTO);

            return ResponseEntity.ok(responsePage);
        } catch (RuntimeException e) {
            throw new RuntimeException(e);
        }
    }


    @GetMapping("/applications/{id}")
    public ResponseEntity<?> getApplicationById(HttpServletRequest request,@PathVariable Long id) {

        // 🔑 Get JWT from cookie
        String token = null;
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("access_token".equals(cookie.getName())) { // <-- replace "token" with your cookie name
                    token = cookie.getValue();
                    break;
                }
            }
        }
        if (token == null) {
            return ResponseEntity.status(401).body("Missing access_token cookie");
        }

        // 🔑 Extract role & id from token
        String role = (String) request.getAttribute("role");

        if (!"HR".equalsIgnoreCase(role) && !"UNIVERSITY".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only HR and University can access this resource"));
        }


        Application application = applicationService.getApplicationById(id);

        // ✅ Convert to DTO with applicant data
        ApplicationResponseDTO applicationDTO = mapToDTO(application);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Application fetched successfully");
        response.put("success", true);
        response.put("data", applicationDTO);

        return ResponseEntity.ok(response);
    }


    @PostMapping(value = "/application/batch", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> batchImport(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {

        try {
            // 🔑 Get JWT from cookie
            String token = null;
            if (request.getCookies() != null) {
                for (Cookie cookie : request.getCookies()) {
                    if ("access_token".equals(cookie.getName())) { // <-- replace "token" with your cookie name
                        token = cookie.getValue();
                        break;
                    }
                }
            }
            if (token == null) {
                return ResponseEntity.status(401).body("Missing access_token cookie");
            }

            // 🔑 Extract role & id from token
            String role = (String) request.getAttribute("role");

            if (!"UNIVERSITY".equalsIgnoreCase(role)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Only universities can access this resource"));
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
            HttpServletRequest request) {

        try {
            String token = null;
            if (request.getCookies() != null) {
                for (Cookie cookie : request.getCookies()) {
                    if ("access_token".equals(cookie.getName())) {
                        token = cookie.getValue();
                        break;
                    }
                }
            }
            if (token == null) {
                return ResponseEntity.status(401).body("Missing access_token cookie");
            }

            String role = (String) request.getAttribute("role");

            if (!"HR".equalsIgnoreCase(role)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Only HR can update application status."));
            }

            ApplicationDTO updated = applicationService.updateApplicationStatus(
                    id, ApplicationStatus.valueOf(status), token
            );

            // ✅ Fetch application + applicant
            Application application = applicationRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Application not found"));

            Applicant applicant = application.getApplicant();

            // ✅ Send Notification via gRPC
            String message = String.format("Application for student %s %s (%s) has been %s.",
                    applicant.getFirstName(),
                    applicant.getLastName(),
                    applicant.getEmail(),
                    status.toUpperCase()
            );

            try {
                notificationGrpcClient.sendNotification(
                        Set.of(RecipientRole.University), // ✅ send to university
                        "Application Status Update",
                        message,                          // ✅ use message as description
                        Instant.now(),
                        NotificationType.CHANGE // ✅ use gRPC enum
                );
            } catch (Exception e) {
                System.err.println("⚠️ Failed to send gRPC notification: " + e.getMessage());
            }

            return ResponseEntity.ok(updated);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(400).body(error);
        }
    }

    @GetMapping("/applications/search")
    public ResponseEntity<?> searchApplicants(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {

        try{
            // 🔑 Get JWT from cookie
            String token = null;
            if (request.getCookies() != null) {
                for (Cookie cookie : request.getCookies()) {
                    if ("access_token".equals(cookie.getName())) { // <-- replace "token" with your cookie name
                        token = cookie.getValue();
                        break;
                    }
                }
            }
            if (token == null) {
                return ResponseEntity.status(401).body("Missing access_token cookie");
            }

            // 🔑 Extract role & id from token
            String role = (String) request.getAttribute("role");

            if (!"HR".equalsIgnoreCase(role)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Only HR can access this resource"));
            }

            Pageable pageable = PageRequest.of(page, size);
            Page<Application> pageResult = applicationService.searchApplicants(query, pageable);

            List<ApplicationResponseDTO> content = pageResult.getContent().stream()
                    .map(this::mapToDTO)
                    .toList();

            return ResponseEntity.ok(Map.of(
                    "content", content,
                    "currentPage", pageResult.getNumber(),
                    "totalPages", pageResult.getTotalPages(),
                    "totalElements", pageResult.getTotalElements()
            ));
        } catch (RuntimeException e) {
            throw new RuntimeException(e);
        }
    }



    @GetMapping("/applications/filter/status")
    public ResponseEntity<?> filterByStatus(@RequestParam("status") String status,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "10") int size,
                                            HttpServletRequest request) {

        try{
            // 🔑 Get JWT from cookie
            String token = null;
            if (request.getCookies() != null) {
                for (Cookie cookie : request.getCookies()) {
                    if ("access_token".equals(cookie.getName())) { // <-- replace "token" with your cookie name
                        token = cookie.getValue();
                        break;
                    }
                }
            }
            if (token == null) {
                return ResponseEntity.status(401).body("Missing access_token cookie");
            }

            // 🔑 Extract role & id from token
            String role = (String) request.getAttribute("role");

            if (!"HR".equalsIgnoreCase(role)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Only HR can access this resource"));
            }

            Pageable pageable = PageRequest.of(page, size);
            Page<Application> result = applicationService.filterByStatus(ApplicationStatus.valueOf(status), pageable);

            List<ApplicationResponseDTO> response = result.stream().map(this::mapToDTO).toList();

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            throw new RuntimeException(e);
        }
    }


    @GetMapping("/applications/filter/position")
    public ResponseEntity<?> filterByPosition(@RequestParam("position") String position,
                                              @RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "10") int size,
                                              HttpServletRequest request) {

        try{
            // 🔑 Get JWT from cookie
            String token = null;
            if (request.getCookies() != null) {
                for (Cookie cookie : request.getCookies()) {
                    if ("access_token".equals(cookie.getName())) { // <-- replace "token" with your cookie name
                        token = cookie.getValue();
                        break;
                    }
                }
            }
            if (token == null) {
                return ResponseEntity.status(401).body("Missing access_token cookie");
            }

            // 🔑 Extract role & id from token
            String role = (String) request.getAttribute("role");

            if (!"HR".equalsIgnoreCase(role)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Only HR can access this resource"));
            }


            Pageable pageable = PageRequest.of(page, size);
            Page<Application> result = applicationService.filterByPosition(position, pageable);

            List<ApplicationResponseDTO> response = result.stream().map(this::mapToDTO).toList();

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            throw new RuntimeException(e);
        }
    }



    @GetMapping("/applications/filter/university")
    public ResponseEntity<?> filterByUniversity(@RequestParam("university") String university,
                                                @RequestParam(defaultValue = "0") int page,
                                                @RequestParam(defaultValue = "10") int size,
                                                HttpServletRequest request) {
        try{

            // 🔑 Get JWT from cookie
            String token = null;
            if (request.getCookies() != null) {
                for (Cookie cookie : request.getCookies()) {
                    if ("access_token".equals(cookie.getName())) { // <-- replace "token" with your cookie name
                        token = cookie.getValue();
                        break;
                    }
                }
            }

            if (token == null) {
                return ResponseEntity.status(401).body("Missing access_token cookie");
            }

            // 🔑 Extract role & id from token
            String role = (String) request.getAttribute("role");

            if (!"HR".equalsIgnoreCase(role)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Only HR can access this resource"));
            }


            Pageable pageable = PageRequest.of(page, size);
            Page<Application> result = applicationService.filterByUniversity(university, pageable);

            List<ApplicationResponseDTO> response = result.stream().map(this::mapToDTO).toList();

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            throw new RuntimeException(e);
        }
    }


    @GetMapping("/applications/filter/for-university")
    public ResponseEntity<?> filterForUniversity(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            // 🔑 Get JWT from cookie
            String token = Arrays.stream(Optional.ofNullable(request.getCookies())
                            .orElse(new Cookie[0]))
                    .filter(c -> "access_token".equals(c.getName()))
                    .findFirst()
                    .map(Cookie::getValue)
                    .orElse(null);

            if (token == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Missing authentication token"));
            }

            // 🔑 Extract role & id from token
            String role = (String) request.getAttribute("role");
            String institution = (String) request.getAttribute("institution");

            if (!"UNIVERSITY".equalsIgnoreCase(role)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Only universities can access this resource"));
            }

            Pageable pageable = PageRequest.of(page, size);

            // 🔑 Pass institution to service
            Page<Application> result = applicationService.filterByUniversity(institution, pageable);

            List<ApplicationResponseDTO> response = result.stream()
                    .map(this::mapToDTO)
                    .toList();

            return ResponseEntity.ok(Map.of(
                    "content", response,
                    "currentPage", result.getNumber(),
                    "totalPages", result.getTotalPages(),
                    "totalElements", result.getTotalElements()
            ));
        } catch (RuntimeException e) {
            throw new RuntimeException(e);
        }
    }



    private ResponseEntity<?> errorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
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
                                .build()
                )
                .build();
    }

}




