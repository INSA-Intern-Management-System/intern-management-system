package com.example.application_service.services;

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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ApplicationServiceImpl implements ApplicationService{

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
                .status(dto.getApplicationStatus())
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
                .status(saved.getApplicationStatus())
                .build();

        return savedDto;
    }

    @Override
    public ApplicationDTO createApplication(ApplicationDTO dto) {
        Applicant applicant = applicantRepository.findById(dto.getApplicantId())
                .orElseThrow(() -> new RuntimeException("Applicant not found"));

        Application application = Application.builder()
                .applicant(applicant)
                .status(dto.getStatus())
                .createdAt(LocalDateTime.now())
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
//
//    @Override
//    public Optional<ApplicantDTO> getApplicantByUserId(Integer userId) {
//        return applicantRepository.findByUserId(userId)
//                .map(a -> ApplicantDTO.builder()
//                        .id(a.getId())
//                        .firstName(a.getFirstName())
//                        .lastName(a.getLastName())
//                        .email(a.getEmail())
//                        .phoneNumber(a.getPhoneNumber())
//                        .institution(a.getInstitution())
//                        .fieldOfStudy(a.getFieldOfStudy())
//                        .gender(a.getGender())
//                        .duration(a.getDuration())
//                        .linkedinUrl(a.getLinkedinUrl())
//                        .githubUrl(a.getGithubUrl())
//                        .cvUrl(a.getCvUrl())
//                        .applicationStatus(a.getApplicationStatus())
//                        .build());
//    }
}
