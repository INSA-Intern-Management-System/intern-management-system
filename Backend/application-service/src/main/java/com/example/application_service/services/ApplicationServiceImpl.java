package com.example.application_service.services;

import com.example.application_service.dto.ApplicantDTO;
import com.example.application_service.dto.ApplicationDTO;
import com.example.application_service.dto.CreateUserRequest;
import com.example.application_service.model.*;
import com.example.application_service.repository.ApplicantRepository;
import com.example.application_service.repository.ApplicationRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ApplicationServiceImpl implements ApplicationService{

    @Autowired
    private RestTemplate restTemplate;


    @Value("${user.service.url}") // e.g., http://user-service/api/users
    private String userServiceUrl;

    private final ApplicantRepository applicantRepository;
    private final ApplicationRepository applicationRepository;
//    private final UserServiceClient userServiceClient;
    private final CloudinaryService cloudinaryService;

    public ApplicationServiceImpl(ApplicantRepository applicantRepository,
                              ApplicationRepository applicationRepository,
                              CloudinaryService cloudinaryService) {
        this.applicantRepository = applicantRepository;
        this.applicationRepository = applicationRepository;
        this.cloudinaryService = cloudinaryService;
    }

    @Override
    public ApplicantDTO createApplicant(ApplicantDTO dto, MultipartFile cvFile) throws IOException {
        // Upload CV to Cloudinary
        String cvUrl = null;
        if (cvFile != null && !cvFile.isEmpty()) {
            cvUrl = cloudinaryService.uploadFile(cvFile);
        }
        dto.setCvUrl(cvUrl);

        Applicant applicant = Applicant.builder()
                .id(dto.getId())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .phoneNumber(dto.getPhoneNumber())
                .institution(dto.getInstitution())
                .fieldOfStudy(dto.getFieldOfStudy())
                .gender(dto.getGender())
                .duration(dto.getDuration())
                .linkedInUrl(dto.getLinkedInUrl())
                .githubUrl(dto.getGithubUrl())
                .cvUrl(dto.getCvUrl())
                .build();

        Applicant saved = applicantRepository.save(applicant);

        ApplicantDTO savedDto = ApplicantDTO.builder()
                .id(saved.getId())
                .firstName(saved.getFirstName())
                .lastName(saved.getLastName())
                .email(saved.getEmail())
                .phoneNumber(saved.getPhoneNumber())
                .institution(saved.getInstitution())
                .fieldOfStudy(saved.getFieldOfStudy())
                .gender(saved.getGender())
                .duration(saved.getDuration())
                .linkedInUrl(saved.getLinkedInUrl())
                .githubUrl(saved.getGithubUrl())
                .cvUrl(saved.getCvUrl())
                .createdAt(saved.getCreatedAt())
                .build();

        return savedDto;
    }

    @Override
    public Application createApplication(ApplicationDTO dto) {
        Applicant applicant = applicantRepository.findById(dto.getApplicantId())
                .orElseThrow(() -> new RuntimeException("Applicant not found"));

        Application application = Application.builder()
                .applicant(applicant)
                .status(dto.getStatus())
                .createdAt(LocalDateTime.now())
                .build();

        Application saved = applicationRepository.save(application);
//        dto.setId(saved.getId());
        return saved;
    }

    @Override
    public Page<Application> getAllApplications(Pageable pageable
    ) {
        return applicationRepository.findAll(pageable);
    }

    @Override
    public List<ApplicationDTO> getApplicationByApplicantId(Long applicantId) {
        return applicationRepository.findByApplicantId(applicantId)
                .stream()
                .map(application -> ApplicationDTO.builder()
                        .id(application.getId())
                        .applicantId(application.getApplicant().getId())
                        .status(application.getStatus())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<ApplicantDTO> batchApplication(MultipartFile file) throws IOException {
        List<ApplicantDTO> applicantDTOs = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            boolean isFirstLine = true;

            while ((line = reader.readLine()) != null) {
                if (isFirstLine) {
                    isFirstLine = false; // skip header
                    continue;
                }

                String[] data = line.split(",");

                if (data.length < 10) continue; // adjust based on your columns

                Applicant applicant = Applicant.builder()
                        .firstName(data[0].trim())
                        .lastName(data[1].trim())
                        .email(data[2].trim())
                        .phoneNumber(data[3].trim())
                        .institution(data[4].trim())
                        .fieldOfStudy(data[5].trim())
                        .gender(data[6].trim())
                        .duration(data[7].trim())
                        .linkedInUrl(data[8].trim())
                        .githubUrl(data[9].trim())
                        .cvUrl(data.length > 10 ? data[10].trim() : null)
                        .build();

                Applicant saved = applicantRepository.save(applicant);

                ApplicantDTO dto = ApplicantDTO.builder()
                        .id(saved.getId()) // ✅ include this
                        .firstName(saved.getFirstName())
                        .lastName(saved.getLastName())
                        .email(saved.getEmail())
                        .phoneNumber(saved.getPhoneNumber())
                        .institution(saved.getInstitution())
                        .fieldOfStudy(saved.getFieldOfStudy())
                        .gender(saved.getGender())
                        .duration(saved.getDuration())
                        .linkedInUrl(saved.getLinkedInUrl())
                        .githubUrl(saved.getGithubUrl())
                        .cvUrl(saved.getCvUrl())
                        .createdAt(saved.getCreatedAt())
                        .build();

                applicantDTOs.add(dto);
            }
        }

        return applicantDTOs;
    }

    @Override
    public ApplicationDTO updateApplicationStatus(Long applicationId, ApplicationStatus status) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        application.setStatus(status);
        applicationRepository.save(application);

        if (status == ApplicationStatus.Accepted) {
            Applicant applicant = application.getApplicant();

            // Generate a random password
            String generatedPassword = generateRandomPassword(10);
            System.out.println("Generated password for new Accepted user(Intern): " + generatedPassword);


            // Build payload to send to user service
            CreateUserRequest userRequest = new CreateUserRequest();

            userRequest.setFirstName(applicant.getFirstName());
            userRequest.setLastName(applicant.getLastName());
            userRequest.setEmail(applicant.getEmail());
            userRequest.setPhoneNumber(applicant.getPhoneNumber());
            userRequest.setFieldOfStudy(applicant.getFieldOfStudy());
            userRequest.setInstitution(applicant.getInstitution());
            userRequest.setGender(applicant.getGender());
            userRequest.setDuration(applicant.getDuration());
            userRequest.setLinkedInUrl(applicant.getLinkedInUrl());
            userRequest.setGithubUrl(applicant.getGithubUrl());
            userRequest.setCvUrl(applicant.getCvUrl());
            userRequest.setPassword(generatedPassword);
            userRequest.setUserStatus(UserStatus.ACTIVE);
            userRequest.setRole(UserRole.STUDENT);


            try {
                restTemplate.postForEntity(userServiceUrl, userRequest, Void.class);
            } catch (Exception ex) {
                throw new RuntimeException("Failed to create user in user service: " + ex.getMessage());
            }
        }

        return ApplicationDTO.builder()
                .id(application.getId())
                .status(application.getStatus())
                .applicantId(application.getApplicant().getId())
                .build();
    }

    @Override
    public Page<Application> searchApplicants(String query, Pageable pageable) {
        return applicationRepository
                .findByApplicant_FirstNameContainingIgnoreCaseOrApplicant_InstitutionContainingIgnoreCaseOrApplicant_FieldOfStudyContainingIgnoreCase(
                        query, query, query, pageable);

    }

    @Override
    public Page<Application> filterByStatus(ApplicationStatus status, Pageable pageable) {
        return applicationRepository.findByStatus(status, pageable);
    }

    @Override
    public Page<Application> filterByPosition(String position, Pageable pageable) {
        return applicationRepository.findByApplicant_FieldOfStudyContainingIgnoreCase(position, pageable);
    }

    @Override
    public Page<Application> filterByUniversity(String university, Pageable pageable) {
        return applicationRepository.findByApplicant_InstitutionContainingIgnoreCase(university, pageable);
    }


    private String generateRandomPassword(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!";
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder();


        for (int i = 0; i < length; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }

        return password.toString();
    }

}
