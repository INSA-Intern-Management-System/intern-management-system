package com.example.userservice.service;

import com.example.userservice.dto.UniversityLoginRequest;
import com.example.userservice.dto.UniversityRegisterRequest;
import com.example.userservice.model.University;
import com.example.userservice.model.User;

public interface UniversityService {

    University registerUniversity(UniversityRegisterRequest universityRegisterRequest);
    University universityLogin(UniversityLoginRequest request);

    University getUniversityByEmail(String email);
    University getUniversityById(Long id);

    University saveUser(University university);
}
