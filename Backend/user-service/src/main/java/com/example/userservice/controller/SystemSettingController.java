package com.example.userservice.controller;

import com.example.userservice.dto.SystemStatus;
import com.example.userservice.model.SystemSetting;
import com.example.userservice.service.SystemHealthService;
import com.example.userservice.service.SystemSettingService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/system/setting")
public class SystemSettingController {

    private final SystemSettingService systemSettingService;
    private final SystemHealthService systemHealthService;

    public SystemSettingController(SystemSettingService systemSettingService, SystemHealthService systemHealthService) {
        this.systemSettingService = systemSettingService;
        this.systemHealthService = systemHealthService;
    }

    @GetMapping
    public ResponseEntity<?> getCompanyProfile(){
        try {
            SystemSetting systemSetting = systemSettingService.getSystemSetting();

            Map<String, Object> response = new HashMap<>();
            response.put("message", "System setting fetched successfully");
            response.put("system-setting", systemSetting);
            return ResponseEntity.status(201).body(response);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(400).body(error);
        }
    }

    @PutMapping()
    public ResponseEntity<?> updateSystemSetting(@RequestBody SystemSetting newSystemSetting, HttpServletRequest request){
        try {

            String role = (String) request.getAttribute("role");

            if(role == null || !"ADMIN".equalsIgnoreCase(role)){
                return errorResponse("Unauthorized: Only Admin update company profile!!");
            }

            SystemSetting systemSetting = systemSettingService.updateSystemSetting(newSystemSetting);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "System Setting updated successfully");
            response.put("Updated system setting", systemSetting);
            return ResponseEntity.status(201).body(response);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(400).body(error);
        }
    }


    @PostMapping("/create")
    public ResponseEntity<?> registerSystemSetting(@RequestBody SystemSetting systemSetting, HttpServletRequest request){
        try {

            String role = (String) request.getAttribute("role");

            if(role == null || !"ADMIN".equalsIgnoreCase(role)){
                return errorResponse("Unauthorized: Only Admin Register Users!!");
            }

            SystemSetting systemSetting1 = systemSettingService.registerSystem(systemSetting);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "System setting registered successfully");
            response.put("Created System Setting", systemSetting1);
            return ResponseEntity.status(201).body(response);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(400).body(error);
        }
    }

    @GetMapping("/health")
    public ResponseEntity<?> getSystemHealth() {
        try {
            List<SystemStatus> healthStatus = systemHealthService.getSystemHealth();
            Map<String, Object> response = new HashMap<>();
            response.put("message", "System health fetched successfully");
            response.put("health", healthStatus);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return errorResponse("Failed to fetch system health: " + e.getMessage());
        }
    }




    private ResponseEntity<?> errorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }




}
