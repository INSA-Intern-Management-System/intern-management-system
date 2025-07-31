package com.example.userservice.controller;


import com.example.userservice.dto.AdminResetPasswordRequest;
import com.example.userservice.dto.UserResponseDto;
import com.example.userservice.model.Role;
import com.example.userservice.model.User;
import com.example.userservice.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        try{
           List<User> users  = userService.getAllUsers();

            List<UserResponseDto> userDtos = users.stream()
                    .map(UserResponseDto::new)
                    .toList();

            return ResponseEntity.ok(userDtos);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(400).body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUserById(@PathVariable Long id){
        try{
            userService.deleteUser(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "User deleted successfully");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(400).body(error);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id){
        try{
            User user = userService.getUserById(id);
            return ResponseEntity.ok(new UserResponseDto(user));
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(400).body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User user) {
        try {
            User updatedUser = userService.updateUser(id, user);
            return ResponseEntity.ok(new UserResponseDto(updatedUser));
        } catch (Exception e) {
            // You can customize error response here
            return ResponseEntity
                    .badRequest()
                    .body("Failed to update user: " + e.getMessage());
        }
    }

    @GetMapping("/interns")
    public ResponseEntity<?> getInterns(HttpServletRequest request,
                                        @RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "10") int size){
        try{

            String role = (String) request.getAttribute("role");

            if (role == null) {
                return errorResponse("Unauthorized: Role not found in request");
            }

            if (!"HR".equalsIgnoreCase(role) && !"Project_Manager".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized: Only HR or Project Manager can search applicants");
            }

            Pageable pageable = PageRequest.of(page, size);

            Page<User> interns = userService.getInterns(Role.University, pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Fetched interns successfully");
            response.put("interns", interns);
            return ResponseEntity.status(201).body(response);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());

            return ResponseEntity.status(400).body(error);
        }
    }


    @GetMapping("/supervisors")
    public ResponseEntity<?> getSupervisors(HttpServletRequest request,
                                        @RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "10") int size){
        try{

            String role = (String) request.getAttribute("role");

            if (role == null) {
                return errorResponse("Unauthorized: Role not found in request");
            }

            if (!"HR".equalsIgnoreCase(role) && !"Project_Manager".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized: Only HR or Project Manager can search applicants");
            }

            Pageable pageable = PageRequest.of(page, size);

            Page<User> supervisors = userService.getSupervisors(Role.Supervisor, pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Fetched supervisors successfully");
            response.put("interns", supervisors);
            return ResponseEntity.status(201).body(response);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());

            return ResponseEntity.status(400).body(error);
        }
    }



    @PostMapping("/admin/reset-password")
    public ResponseEntity<?> adminResetUserPassword(
            HttpServletRequest request,
            @RequestBody AdminResetPasswordRequest resetRequest) {
        try {
            String role = (String) request.getAttribute("role"); // Extracted by JwtAuthenticationFilter

            if (role == null || !"Admin".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized: Only Admin users can reset passwords.");
            }

            if (resetRequest.getNewPassword() == null || resetRequest.getNewPassword().length() < 6) {
                return errorResponse("New password must be at least 6 characters long.");
            }

            User updatedUser = userService.adminResetUserPassword(
                    resetRequest.getTargetUserEmail(),
                    resetRequest.getNewPassword()
            );

            Map<String, String> response = new HashMap<>();
            response.put("message", "Password for user " + updatedUser.getEmail() + " has been successfully reset by admin.");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }




    @GetMapping("/search")
    public ResponseEntity<?> searchApplicants(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {

        String role = (String) request.getAttribute("role");

        if (!"HR".equalsIgnoreCase(role) && !"Project_Manager".equalsIgnoreCase(role)) {
            return errorResponse("Unauthorized: Only HR or Project Manager can search users");
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<User> pageResult = userService.searchInterns(query, pageable);

        List<UserResponseDto> content = pageResult.getContent().stream()
                .map(this::mapToDTO)
                .toList();

        return ResponseEntity.ok(Map.of(
                "content", content,
                "currentPage", pageResult.getNumber(),
                "totalPages", pageResult.getTotalPages(),
                "totalElements", pageResult.getTotalElements()
        ));
    }


    @GetMapping("/filter")
    public ResponseEntity<?> filterByInstitution(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {

        String role = (String) request.getAttribute("role");

        if (!"HR".equalsIgnoreCase(role) && !"Project_Manager".equalsIgnoreCase(role)) {
            return errorResponse("Unauthorized: Only HR or Project Manager can search users");
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<User> pageResult = userService.filterByInstitution(query, pageable);

        List<UserResponseDto> content = pageResult.getContent().stream()
                .map(this::mapToDTO)
                .toList();

        return ResponseEntity.ok(Map.of(
                "content", content,
                "currentPage", pageResult.getNumber(),
                "totalPages", pageResult.getTotalPages(),
                "totalElements", pageResult.getTotalElements()
        ));
    }





    private ResponseEntity<?> errorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }


    private UserResponseDto mapToDTO(User user) {
        return new UserResponseDto(user);
    }


}
