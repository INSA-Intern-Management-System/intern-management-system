package com.example.application_service.repository;

import com.example.application_service.model.Applicant;
import com.example.application_service.model.Application;
import com.example.application_service.model.ApplicationStatus;
import feign.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByApplicantId(Long applicantId);


    // Search by first name or last name or email (case-insensitive contains)
    Page<Application> findByApplicant_FirstNameEqualsIgnoreCaseOrApplicant_InstitutionEqualsIgnoreCaseOrApplicant_FieldOfStudyEqualsIgnoreCase(
            String firstName, String institution, String fieldOfStudy, Pageable pageable
    );

    Page<Application> findByApplicant_InstitutionEqualsIgnoreCaseAndApplicant_FirstNameEqualsIgnoreCaseOrApplicant_InstitutionEqualsIgnoreCaseAndApplicant_FieldOfStudyEqualsIgnoreCase(
            String institution1, String firstName,
            String institution2, String fieldOfStudy,
            Pageable pageable
    );

    Page<Application> findByApplicant_InstitutionEqualsIgnoreCaseAndStatus(
            String institution, ApplicationStatus status, Pageable pageable
    );


    // Filter by status
    Page<Application> findByStatus(ApplicationStatus status, Pageable pageable);

    // Filter by position
    Page<Application> findByApplicant_FieldOfStudyContainingIgnoreCase(String fieldOfStudy, Pageable pageable);

    // Filter by university
    Page<Application> findByApplicant_InstitutionEqualsIgnoreCase(String institution, Pageable pageable);

    //count application by application status
    Long countByStatus(ApplicationStatus status);


}
