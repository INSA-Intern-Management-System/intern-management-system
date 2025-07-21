package com.example.application_service.repository;

import com.example.application_service.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Integer> {
    List<Application> findByApplicantId(Integer applicantId);
}
