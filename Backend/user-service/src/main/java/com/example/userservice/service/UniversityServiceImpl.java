package com.example.userservice.service;

import com.example.userservice.dto.UniversityDto;
import com.example.userservice.dto.UniversityLoginRequest;
import com.example.userservice.dto.UniversityRegisterRequest;
import com.example.userservice.model.University;
import com.example.userservice.model.User;
import com.example.userservice.repository.UniversityRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UniversityServiceImpl implements UniversityService {

    private final UniversityRepository universityRepo;
    private final BCryptPasswordEncoder passwordEncoder;


    public UniversityServiceImpl(UniversityRepository universityRepo,BCryptPasswordEncoder passwordEncoder) {
        this.universityRepo = universityRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public University registerUniversity(UniversityRegisterRequest  universityRegisterRequest) {
        if (universityRepo.findByEmail(universityRegisterRequest.email) != null) {
            throw new RuntimeException("University already exists with email: ");
        }

        University university = new University();
        university.setName(universityRegisterRequest.name);
        university.setEmail(universityRegisterRequest.email);
        university.setDescription(universityRegisterRequest.description);
        university.setAddress(universityRegisterRequest.address);

        String hashedPassword = passwordEncoder.encode(universityRegisterRequest.password);
        university.setPassword(hashedPassword);

        return universityRepo.save(university);
    }


    @Override
    public University universityLogin(UniversityLoginRequest universityLoginRequest) {
        University university = universityRepo.findByEmail(universityLoginRequest.email);

        if (university == null) {
            throw new RuntimeException("University not found with this email: " + universityLoginRequest.email);
        }

        if (!passwordEncoder.matches(universityLoginRequest.password, university.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        return university;
    }

    @Override
    public University saveUser(University university) {
        return universityRepo.save(university);
    }

    @Override
    public University getUniversityByEmail(String email) {
        return universityRepo.findByEmail(email);
    }

    @Override
    public University getUniversityById(Long id) {
        return universityRepo.findById(id).get();
    }


}
