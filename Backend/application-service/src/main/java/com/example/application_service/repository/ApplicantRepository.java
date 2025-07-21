package com.example.application_service.repository;

import com.example.application_service.model.Applicant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ApplicantRepository extends JpaRepository<Applicant, Integer> {
    Optional<Applicant> findByUserId(Integer userId);
}
