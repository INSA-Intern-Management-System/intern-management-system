package com.example.application_service.services;

import com.example.application_service.dto.ApplicantDTO;
import com.example.application_service.dto.ApplicationDTO;
import com.example.application_service.model.Applicant;
import com.example.application_service.model.Application;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

public interface ApplicationService {

    ApplicantDTO createApplicant(ApplicantDTO dto, MultipartFile cvFile) throws IOException;

    ApplicationDTO createApplication(ApplicationDTO dto);

    List<Application> getAllApplications();

//    Optional<ApplicantDTO> getApplicantByUserId(Long userId);

    List<ApplicationDTO> getApplicationByApplicantId( Long applicantId);
}
