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

    List<Application> findByStatus(ApplicationStatus status);

    @Query("SELECT a FROM Application a JOIN a.applicant ap WHERE " +
            "LOWER(ap.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(ap.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(ap.institution) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(ap.fieldOfStudy) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Application> searchApplicationsByApplicant(@Param("query") String query, Pageable pageable);

    @Query("SELECT a FROM Application a WHERE a.status = :status")
    List<Application> filterByStatus(@Param("status") ApplicationStatus status);

    @Query("SELECT a FROM Application a WHERE a.applicant.fieldOfStudy = :position")
    List<Application> filterByPosition(@Param("position") String position);

    @Query("SELECT a FROM Application a WHERE a.applicant.institution = :university")
    List<Application> filterByUniversity(@Param("university") String university);
}
