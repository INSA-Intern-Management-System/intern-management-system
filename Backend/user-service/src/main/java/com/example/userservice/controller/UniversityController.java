package com.example.userservice.controller;

import com.example.userservice.dto.*;
import com.example.userservice.model.University;
import com.example.userservice.model.User;
import com.example.userservice.repository.UniversityRepository;
import com.example.userservice.security.JwtUtil;
import com.example.userservice.service.UniversityService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/universities")
public class UniversityController {

    private final UniversityService universityService;
    private final JwtUtil jwtUtil;

    public UniversityController(UniversityService universityService, JwtUtil jwtUtil) {
        this.universityService = universityService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UniversityRegisterRequest request) {
       try{
           University university = universityService.registerUniversity(request);

           Map<String, Object> response = new HashMap<>();
           response.put("message", "User registered successfully");
           response.put("user", new UniversityDto(university));
           return ResponseEntity.status(201).body(response);
       }catch (RuntimeException e) {
           Map<String, String> error = new HashMap<>();
           error.put("error", e.getMessage());
           return ResponseEntity.status(400).body(error);
       }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UniversityLoginRequest request) {
       try{

           System.out.println("inside try");
           University university = universityService.universityLogin(request);


           university.setLastLogin(new Date());
           universityService.saveUser(university);


//           University singleUniversity = universityService.getUniversityByEmail(request.email);
//           String token = jwtUtil.generateToken(singleUniversity, university.getLastLogin());

           UniversityAuthResponse authResponse = new UniversityAuthResponse(
                   "University logged in successfully",
//                   token,
                   new UniversityDto(university)
           );

           return ResponseEntity.status(201).body(authResponse);

       }catch (RuntimeException e) {
           Map<String, String> error = new HashMap<>();
           error.put("error", e.getMessage());
           return ResponseEntity.status(400).body(error);
       }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSingleUniversityById(@PathVariable Long id){
        try{
            University university = universityService.getUniversityById(id);
            return ResponseEntity.ok(new UniversityDto(university));
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(400).body(error);
        }
    }

}
