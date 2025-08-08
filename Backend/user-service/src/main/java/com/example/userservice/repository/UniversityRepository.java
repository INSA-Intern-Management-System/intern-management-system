package com.example.userservice.repository;

import com.example.userservice.model.University;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UniversityRepository extends JpaRepository<University, Long> {
    University findByEmail(String email);
}
