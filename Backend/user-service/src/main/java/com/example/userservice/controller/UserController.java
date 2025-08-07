package com.example.userservice.controller;


import com.example.userservice.dto.*;
import com.example.userservice.model.Role;
import com.example.userservice.model.Role;
import com.example.userservice.model.User;
import com.example.userservice.model.UserStatusCount;
import com.example.userservice.repository.RoleRepository;
import com.example.userservice.service.UserService;
import jakarta.servlet.http.HttpServlet;
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
    private final RoleRepository roleRepo;

    public UserController(UserService userService, RoleRepository roleRepo) {
        this.userService = userService;
        this.roleRepo = roleRepo;
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers(@RequestParam(defaultValue = "0") int page,
                                         @RequestParam(defaultValue = "10") int size) {
        try{
            Pageable pageable = PageRequest.of(page,size);

           Page<User> users  = userService.getAllUsers(pageable);

           Long totalUser = userService.countAllUsers();

            Map<String, Object> response = new HashMap<>();
            response.put("message", "All Users fetched successfully");
            response.put("Users", users);
            response.put("totalUser", totalUser);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(400).body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUserById(@PathVariable Long id, HttpServletRequest request){
        try{

            String role = (String) request.getAttribute("role");

            if (role == null || !"ADMIN".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized: Only Admin users can delete user.");
            }

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

    @PutMapping("/update-password/{id}")
    public ResponseEntity<?> updatePassword(@RequestBody UpdatePasswordDTO dto, @PathVariable Long id, HttpServletRequest request) {
            String role = (String) request.getAttribute("role");

            if (role == null || !(role.equalsIgnoreCase("HR") ||
                    role.equalsIgnoreCase("PROJECT_MANAGER") ||
                    role.equalsIgnoreCase("STUDENT") ||
                    role.equalsIgnoreCase("ADMIN") ||
                    role.equalsIgnoreCase("SUPERVISOR") ||
                    role.equalsIgnoreCase("UNIVERSITY"))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
            }

            try {
                userService.updateUserPassword(id, dto);

                return ResponseEntity.ok("Password updated successfully");
            } catch (RuntimeException e) {
                return ResponseEntity.badRequest().body(e.getMessage());
            }
        }


    @PutMapping("/{id}")
    public ResponseEntity<?> updateUserProfile(@PathVariable Long id, @RequestBody User user) {
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
    public ResponseEntity<?> getInterns(
                                        @RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "10") int size) {
        try {

            Pageable pageable = PageRequest.of(page, size);
            // Fetch the Roles entity for "STUDENT"
            Role studentRole = roleRepo.findByName("STUDENT");

            Page<User> interns = userService.getInterns(studentRole, pageable);

            long totalInterns = userService.countInterns(); // count of all

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Fetched interns successfully");
            response.put("interns", interns.getContent()); // paginated data
            response.put("totalPages", interns.getTotalPages()); // optional
            response.put("currentPage", interns.getNumber());
            response.put("totalInterns", totalInterns); // total count of all interns

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/assign-supervisor")
    public ResponseEntity<?> assignSupervisor(
            @RequestBody AssignSupervisorRequestDTO dto,
            HttpServletRequest request
    ) {
        String role = (String) request.getAttribute("role");

        if (!"UNIVERSITY".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body("Unauthorized: Only UNIVERSITY can assign supervisors.");
        }

        try {
            userService.assignSupervisor(dto);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Supervisor assigned successfully!");
            response.put("Success", true);

            return ResponseEntity.ok().body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }



    @GetMapping("/supervisors")
    public ResponseEntity<?> getSupervisors(
                                        @RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "10") int size){
        try{

            Pageable pageable = PageRequest.of(page, size);

            Role supervisorRole = roleRepo.findByName("SUPERVISOR");


            Page<User> supervisors = userService.getSupervisors(supervisorRole, pageable);

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

            if (role == null || !"ADMIN".equalsIgnoreCase(role)) {
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


    @GetMapping("/status-count")
    public ResponseEntity<?> getUserStatusCounts() {
        List<UserStatusCount> statusCounts = userService.countUsersByStatus();

        Map<String, Long> response = new HashMap<>();
        for (UserStatusCount sc : statusCounts) {
            String key = sc.getUserStatus().name().toLowerCase() + "User"; // e.g., activeUser
            response.put(key, sc.getCount());
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/role-count")
    public ResponseEntity<Map<String, Long>> getUserRoleCounts() {
        Map<String, Long> roleCounts = userService.getUserRoleCounts();
        return ResponseEntity.ok(roleCounts);
    }



    @GetMapping("/interns/search")
    public ResponseEntity<?> searchApplicants(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
             ) {

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

    @GetMapping("/supervisors/search")
    public ResponseEntity<?> searchSupervisors(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
            ) {


        Pageable pageable = PageRequest.of(page, size);
        Page<User> pageResult = userService.searchSupervisors(query, pageable);

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

    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<User> pageResult = userService.searchUsers(query, pageable);

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


    @GetMapping("/filter-interns-by-university")
    public ResponseEntity<?> filterInternByUniversity(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
            ) {

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


    @GetMapping("/filter-by-role")
    public ResponseEntity<?> filterByRole(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
            ) {

        Pageable pageable = PageRequest.of(page, size);
        Page<User> pageResult = userService.filterUserByRole(query, pageable);

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

    @GetMapping("/filter-interns-by-status")
    public ResponseEntity<?> filterInternByStatus(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {

        Pageable pageable = PageRequest.of(page, size);
        Page<User> pageResult = userService.filterInternByStatus(query, pageable);

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

    @GetMapping("/filter-all-users-by-status")
    public ResponseEntity<?> filterAllUserByStatus(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {

        Pageable pageable = PageRequest.of(page, size);
        Page<User> pageResult = userService.filterAllUsersByStatus(query, pageable);

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



    @PostMapping("/role/create")
    public ResponseEntity<?> createRole(HttpServletRequest request, @RequestBody RolesDTO dto){
        try {
            String userRole = (String) request.getAttribute("role");

            if (userRole == null || !"Admin".equalsIgnoreCase(userRole)) {
                return errorResponse("Unauthorized: Only Admin users can create roles.");
            }

            Role newRole = userService.createRole(dto);

            Map<String,Object> response = new HashMap<>();
            response.put("message", "New Role created successfully");
            response.put("role", newRole);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(400).body(error);
        }


}


    @GetMapping("/filter-intern-by-supervisor")
    public ResponseEntity<?> filterInternsBySupervisor(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
            ) {

        Pageable pageable = PageRequest.of(page, size);
        Page<User> pageResult = userService.filterInternBySupervisor(query, pageable);

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
