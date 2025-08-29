package com.example.application_service.services;

import com.example.application_service.dto.ApplicantDTO;
import com.example.application_service.dto.ApplicationDTO;
import com.example.application_service.model.Applicant;
import com.example.application_service.model.Application;
import com.example.application_service.model.ApplicationStatus;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface ApplicationService {

    ApplicantDTO createApplicant(ApplicantDTO dto, MultipartFile cvFile) throws IOException;

    Application createApplication(ApplicationDTO dto);

    Page<Application> getAllApplications(Pageable pageable);

    Application getApplicationById( Long applicantId);

    List<ApplicantDTO> batchApplication(MultipartFile file) throws IOException;

    ApplicationDTO updateApplicationStatus(Long applicantId, ApplicationStatus status, String jwtToken);

    Page<Application> searchApplicants(String query, Pageable pageable);

    Page<Application> filterByStatus(ApplicationStatus status, Pageable pageable);

    Page<Application> filterByPosition(String position, Pageable pageable);

    Page<Application> filterByUniversity(String university, Pageable pageable);

    HashMap<String,Long> getStats();



}
