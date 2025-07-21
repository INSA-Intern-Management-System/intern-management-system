package com.example.application_service.services;

import com.example.application_service.client.UserServiceClient;
import com.example.application_service.dto.ApplicantDTO;
import com.example.application_service.dto.ApplicationDTO;
import com.example.application_service.model.Applicant;
import com.example.application_service.model.Application;
import com.example.application_service.repository.ApplicantRepository;
import com.example.application_service.repository.ApplicationRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ApplicationServiceImpl implements ApplicationService{

    private final ApplicantRepository applicantRepository;
    private final ApplicationRepository applicationRepository;
    private final UserServiceClient userServiceClient;
    private final CloudinaryService cloudinaryService;

    public ApplicationServiceImpl(ApplicantRepository applicantRepository,
                              ApplicationRepository applicationRepository,
                              UserServiceClient userServiceClient,
                              CloudinaryService cloudinaryService) {
        this.applicantRepository = applicantRepository;
        this.applicationRepository = applicationRepository;
        this.userServiceClient = userServiceClient;
        this.cloudinaryService = cloudinaryService;
    }

    @Override
    public ApplicantDTO createApplicant(ApplicantDTO dto, MultipartFile cvFile) throws IOException {
        // Verify user exists via user-service
        userServiceClient.getUserById(dto.getUserId());

        // Upload CV to Cloudinary
        String cvUrl = null;
        if (cvFile != null && !cvFile.isEmpty()) {
            cvUrl = cloudinaryService.uploadFile(cvFile);
        }
        dto.setCvUrl(cvUrl);

        Applicant applicant = Applicant.builder()
                .userId(dto.getUserId())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .phoneNumber(dto.getPhoneNumber())
                .institution(dto.getInstitution())
                .fieldOfStudy(dto.getFieldOfStudy())
                .gender(dto.getGender())
                .duration(dto.getDuration())
                .linkedinUrl(dto.getLinkedinUrl())
                .githubUrl(dto.getGithubUrl())
                .cvUrl(dto.getCvUrl())
                .applicationStatus(dto.getApplicationStatus())
                .build();

        Applicant saved = applicantRepository.save(applicant);
        dto.setId(saved.getId());
        return dto;
    }

    @Override
    public ApplicationDTO createApplication(ApplicationDTO dto) {
        Application application = Application.builder()
                .applicantId(dto.getApplicantId())
                .status(dto.getStatus())
                .build();

        Application saved = applicationRepository.save(application);
        dto.setId(saved.getId());
        return dto;
    }

    @Override
    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }

    @Override
    public ApplicationDTO getApplicationByApplicantId(Integer applicantId) {
        return applicationRepository.findByApplicantId(applicantId)
                .stream()
                .map(a -> ApplicationDTO.builder()
                        .id(a.getId())
                        .applicantId(a.getApplicantId())
                        .status(a.getStatus())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public Optional<ApplicantDTO> getApplicantByUserId(Integer userId) {
        return applicantRepository.findByUserId(userId)
                .map(a -> ApplicantDTO.builder()
                        .id(a.getId())
                        .userId(a.getUserId())
                        .firstName(a.getFirstName())
                        .lastName(a.getLastName())
                        .email(a.getEmail())
                        .phoneNumber(a.getPhoneNumber())
                        .institution(a.getInstitution())
                        .fieldOfStudy(a.getFieldOfStudy())
                        .gender(a.getGender())
                        .duration(a.getDuration())
                        .linkedinUrl(a.getLinkedinUrl())
                        .githubUrl(a.getGithubUrl())
                        .cvUrl(a.getCvUrl())
                        .applicationStatus(a.getApplicationStatus())
                        .build());
    }
}
