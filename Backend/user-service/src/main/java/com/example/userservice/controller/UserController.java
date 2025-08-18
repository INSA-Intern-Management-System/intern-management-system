package com.example.userservice.controller;


import com.example.activity_service.gRPC.GetRecentActivitiesResponse;
import com.example.project_service.gRPC.AllMilestones;
import com.example.project_service.gRPC.AllProjectResponses;
import com.example.project_service.gRPC.ProjectResponse;
import com.example.userservice.client.ActivityGrpcClient;
import com.example.userservice.client.ProjectManagerGrpcClient;
import com.example.userservice.dto.*;
import com.example.userservice.gRPC.InternManagerResponse;
import com.example.userservice.model.InternManager;
import com.example.userservice.model.Role;
import com.example.userservice.model.Role;
import com.example.userservice.model.User;
import com.example.userservice.model.UserStatusCount;
import com.example.userservice.repository.RoleRepository;
import com.example.userservice.service.InternManagerService;
import com.example.userservice.service.UserService;
import com.google.protobuf.DescriptorProtos.FeatureSet.JsonFormat;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.boot.autoconfigure.graphql.GraphQlProperties.Http;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.http.HttpRequest;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final RoleRepository roleRepo;
    private final ActivityGrpcClient activityGrpcClient;
    private final ProjectManagerGrpcClient projectManagerGrpcClient;
    private final InternManagerService internManagerService;


    public UserController(UserService userService, RoleRepository roleRepo,ActivityGrpcClient activityGrpcClient, ProjectManagerGrpcClient projectManagerGrpcClient,InternManagerService internManagerService) {
        this.userService = userService;
        this.roleRepo = roleRepo;
        this.activityGrpcClient = activityGrpcClient;
        this.projectManagerGrpcClient = projectManagerGrpcClient;
        this.internManagerService = internManagerService;
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers(@RequestParam(defaultValue = "0") int page,
                                         @RequestParam(defaultValue = "10") int size,
                                         HttpServletRequest request) {
        //get role----only admin can do this
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<User> usersPage = userService.getAllUsers(pageable);
            Long totalUser = userService.countAllUsers();

            // Convert each User to UserResponseDto
            List<UserResponseDto> userDtos = usersPage.getContent()
                    .stream()
                    .map(UserResponseDto::new)
                    .toList();

            Map<String, Object> response = new HashMap<>();
            response.put("message", "All Users fetched successfully");
            response.put("users", userDtos);
            response.put("totalUser", totalUser);
            response.put("currentPage", usersPage.getNumber());
            response.put("totalPages", usersPage.getTotalPages());
            response.put("totalElements", usersPage.getTotalElements());

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

    @GetMapping("/me")
    public ResponseEntity<?> getUser(HttpServletRequest request){
        try{

            Long userId = (Long) request.getAttribute("userId");
            User user = userService.getUserById(userId);
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

            List<String> allowedRoles = List.of("HR", "PROJECT_MANAGER", "STUDENT", "ADMIN", "SUPERVISOR", "UNIVERSITY");

            if (role == null || !allowedRoles.contains(role)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
            }

            try {
                userService.updateUserPassword(id, dto);
                return ResponseEntity.ok("Password updated successfully");
            } catch (RuntimeException e) {
                return ResponseEntity.badRequest().body(e.getMessage());
            }
        }

    @PutMapping
    public ResponseEntity<?> updateUserProfile(@PathVariable Long id, @RequestBody User user, HttpServletRequest request) {
        try {
            //get user id and role from request
            Long userId=(Long)request.getAttribute("userId");
            String role = (String) request.getAttribute("role");

            if (role == null || !"STUDENT".equalsIgnoreCase(role)) {
                return ResponseEntity.status(403).body("Access denied");
            }

            // Extract JWT token
            String jwtToken = null;
            if (request.getCookies() != null) {
                for (Cookie cookie : request.getCookies()) {
                    if ("access_token".equals(cookie.getName())) {
                        jwtToken = cookie.getValue();
                        break;
                    }
                }
            }

            if (jwtToken == null) {
                return ResponseEntity.status(401).body("Missing access_token cookie");
            }
            

            User updatedUser = userService.updateUser(id, user);

            //log activity 
            logActivity(jwtToken, userId, "for " + updatedUser.getFirstName() + " " + updatedUser.getLastName()+ "profile update", jwtToken);
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
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        
        //get role---only pm or hr can see the interns
        String role = (String) request.getAttribute("role");
        if(!"PROJECT_MANAGER".equalsIgnoreCase(role) && !"HR".equalsIgnoreCase(role)){
             return ResponseEntity.status(403).body(Map.of("error", "Invalid authority"));
        }
        try {
            Pageable pageable = PageRequest.of(page, size);

            // Extract JWT token
            String jwtToken = null;
            if (request.getCookies() != null) {
                for (Cookie cookie : request.getCookies()) {
                    if ("access_token".equals(cookie.getName())) {
                        jwtToken = cookie.getValue();
                        break;
                    }
                }
            }

            if (jwtToken == null) {
                return ResponseEntity.status(401).body("Missing access_token cookie");
            }

            // Fetch the Roles entity for "STUDENT"
            Role studentRole = roleRepo.findByName("STUDENT");

            Page<User> interns = userService.getInterns(studentRole, pageable);
            long totalInterns = userService.countInterns(); // total count

            // Collect student IDs
            List<Long> studentIds = interns.getContent().stream()
                    .map(User::getId)
                    .toList();

            // Get intern manager info
            List<InternManager> internInfos = internManagerService.getInfos(studentIds);

            // Collect project IDs
            List<Long> projectIds = internInfos.stream()
                    .map(im -> im.getProject().getId())
                    .toList();

            // Fetch projects from gRPC
            AllProjectResponses projects = projectManagerGrpcClient.getProjects(jwtToken, projectIds);

            // Map projectId -> ProjectDTO
            Map<Long, ProjectDTO> projectMap = projects.getProjectsList().stream()
                    .collect(Collectors.toMap(
                            ProjectResponse::getProjectId,
                            p -> new ProjectDTO(p.getProjectId(), p.getProjectName(), p.getProjectDescription())
                    ));

            // Build intern-project mapping
            List<Map<String, Object>> internWithProjects = interns.getContent().stream().map(intern -> {
                Map<String, Object> map = new HashMap<>();
                map.put("intern", intern);

                // Find projects assigned to this intern
                List<ProjectDTO> assignedProjects = internInfos.stream()
                        .filter(im -> im.getUser().getId().equals(intern.getId()))
                        .map(im -> projectMap.get(im.getProject().getId()))
                        .filter(Objects::nonNull)
                        .toList();

                map.put("projects", assignedProjects);
                return map;
            }).toList();

            // Build final response
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Fetched interns successfully");
            response.put("interns", internWithProjects);
            response.put("totalPages", interns.getTotalPages());
            response.put("currentPage", interns.getNumber());
            response.put("totalInterns", totalInterns);

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

            // Extract JWT token
            String jwtToken = null;
            if (request.getCookies() != null) {
                for (Cookie cookie : request.getCookies()) {
                    if ("access_token".equals(cookie.getName())) {
                        jwtToken = cookie.getValue();
                        break;
                    }
                }
            }

            if (jwtToken == null) {
                return ResponseEntity.status(401).body("Missing access_token cookie");
            }


            return ResponseEntity.ok().body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }


     //fix: this one 
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


    @GetMapping("/student/dashboard")
    public ResponseEntity<?> getStudentDashbaord(HttpServletRequest request, Pageable pageable) {
        // 1️⃣ Count users by status
        List<UserStatusCount> statusCounts = userService.countUsersByStatus();
        Map<String, Long> status = new HashMap<>();
        for (UserStatusCount sc : statusCounts) {
            String key = sc.getUserStatus().name().toLowerCase() + "User";
            status.put(key, sc.getCount());
        }

        // 2️⃣ Get userId from request attribute
        Long userId = (Long) request.getAttribute("userId");

        // 3️⃣ Extract JWT from HttpOnly cookie
        String jwtToken = null;
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("access_token".equals(cookie.getName())) {
                    jwtToken = cookie.getValue();
                    break;
                }
            }
        }
        if (jwtToken == null) {
            return ResponseEntity.status(401).body("Missing access_token cookie");
        }

        // 4️⃣ Fetch recent activities from gRPC
        GetRecentActivitiesResponse grpcResponse =
                activityGrpcClient.getRecentActivities(jwtToken, userId, pageable.getPageNumber(), pageable.getPageSize());

        // 5️⃣ Map protobuf response to DTOs
        List<ActivityDTO> activityList = grpcResponse.getActivitiesList().stream()
                .map(a -> new ActivityDTO(
                        a.getId(),
                        a.getUserId(),
                        a.getTitle(),
                        a.getDescription(),
                        LocalDateTime.parse(a.getCreatedAt())
                ))
                .toList();

        // 6️⃣ Fetch intern's project & active milestones
        InternManagerResponseDTO internDTO = internManagerService.getInfoIdByUserId(userId);
        List<MilestoneResponse> milestoneDTOs = new ArrayList<>();
        if (internDTO != null && internDTO.getProjectId() != null) {
            AllMilestones activeMilestones = projectManagerGrpcClient
                    .getActiveMilestones(jwtToken, internDTO.getProjectId());

            if (activeMilestones != null) {
                milestoneDTOs = activeMilestones.getMilestonesList().stream()
                        .map(m -> new MilestoneResponse(
                                m.getMilestoneId(),
                                m.getMilestoneTitle(),
                                m.getMilestoneDescription(),
                                m.getMilestoneStatus(),
                                m.hasMilestoneDueDate()
                                        ? LocalDateTime.ofInstant(
                                        Instant.ofEpochSecond(
                                                m.getMilestoneDueDate().getSeconds(),
                                                m.getMilestoneDueDate().getNanos()
                                        ),
                                        ZoneId.systemDefault()
                                )
                                        : null,
                                m.hasMilestoneCreatedAt()
                                        ? LocalDateTime.ofInstant(
                                        Instant.ofEpochSecond(
                                                m.getMilestoneCreatedAt().getSeconds(),
                                                m.getMilestoneCreatedAt().getNanos()
                                        ),
                                        ZoneId.systemDefault()
                                )
                                        : null
                        ))
                        .toList();
            }
        }

        // 7️⃣ Combine into single response
        Map<String, Object> combinedResponse = new HashMap<>();
        combinedResponse.put("statusCounts", status);
        combinedResponse.put("recentActivities", activityList);
        combinedResponse.put("tasks", milestoneDTOs); // sending mapped list, not raw gRPC object

        return ResponseEntity.ok(combinedResponse);
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

    @GetMapping("/filter-supervisor-by-status")
    public ResponseEntity<?> filterSupervisorByStatus(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {

        Pageable pageable = PageRequest.of(page, size);
        Page<User> pageResult = userService.filterSupervisorByStatus(query, pageable);

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

    @GetMapping("/filter-supervisor-by-field-of-study")
    public ResponseEntity<?> filterSupervisorByFieldOfStudy(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {

        Pageable pageable = PageRequest.of(page, size);
        Page<User> pageResult = userService.filterSupervisorByFieldOfStudy(query, pageable);

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
    private void logActivity(String jwtToken, Long userId, String action, String description) {
        try {
            activityGrpcClient.createActivity(jwtToken, userId, action, description);
        } catch (Exception e) {
            // Log the failure, but do NOT block business logic
            System.err.println("Failed to log activity: " + e.getMessage());
        }
    }


}
