package com.example.userservice.controller;


import com.example.userservice.dto.CompanyProfileDTO;
import com.example.userservice.dto.UserResponseDto;
import com.example.userservice.model.CompanySetting;
import com.example.userservice.service.CompanySettingService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.BeanUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/company/setting")
public class CompanySettingController {

    private final CompanySettingService companySettingService;

    public CompanySettingController(CompanySettingService companySettingService){
        this.companySettingService = companySettingService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> registerCompany(@RequestBody CompanyProfileDTO dto, HttpServletRequest request){
        try {

            String role = (String) request.getAttribute("role");

            if(role == null || !"Admin".equalsIgnoreCase(role)){
                return errorResponse("Unauthorized: Only Admin Register Users!!");
            }

            CompanySetting companyProfile = companySettingService.registerCompany(dto);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Company registered successfully");
            response.put("CompanyProfile", companyProfile);
            return ResponseEntity.status(201).body(response);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(400).body(error);
        }
    }

    @GetMapping
    public ResponseEntity<?> getCompanyProfile(){
        try {
            CompanyProfileDTO companyProfile = companySettingService.getCompanyProfile();

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Company profile fetched successfully");
            response.put("CompanyProfile", companyProfile);
            return ResponseEntity.status(201).body(response);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(400).body(error);
        }
    }


    @PutMapping()
    public ResponseEntity<?> updateCompanyProfile(@RequestBody CompanyProfileDTO newProfile, HttpServletRequest request){
        try {

            String role = (String) request.getAttribute("role");

            if(role == null || !"Admin".equalsIgnoreCase(role)){
                return errorResponse("Unauthorized: Only Admin update company profile!!");
            }

            CompanySetting companyProfile = companySettingService.updateCompanyProfile(newProfile);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Company profile updated successfully");
            response.put("CompanyProfile", companyProfile);
            return ResponseEntity.status(201).body(response);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(400).body(error);
        }
    }



    private ResponseEntity<?> errorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }


}
