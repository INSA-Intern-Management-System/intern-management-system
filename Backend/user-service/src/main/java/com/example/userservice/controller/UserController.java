package com.example.userservice.controller;


import com.example.activity_service.gRPC.GetRecentActivitiesResponse;
import com.example.application_service.gRPC.ApplicationCountResponse;
import com.example.project_service.gRPC.AllMilestones;
import com.example.project_service.gRPC.AllProjectResponses;
import com.example.project_service.gRPC.MilestoneStatsResponse;
import com.example.project_service.gRPC.ProjectResponse;
import com.example.project_service.gRPC.ProjectStatsResponse;
import com.example.project_service.gRPC.StatsResponse;
import com.example.report_service.gRPC.ReportStatsRequest;
import com.example.report_service.gRPC.ReportStatsResponse;
import com.example.report_service.gRPC.TopInterns;
import com.example.report_service.gRPC.TopInternsResponse;
import com.example.report_service.gRPC.TotalReportResponse;
import com.example.userservice.client.ActivityGrpcClient;
import com.example.userservice.client.ApplicationGrpcClient;
import com.example.userservice.client.ProjectManagerGrpcClient;
import com.example.userservice.client.ReportGrpcClient;
import com.example.userservice.dto.*;
import com.example.userservice.gRPC.InternManagerResponse;
import com.example.userservice.model.InternManager;
import com.example.userservice.model.Role;
import com.example.userservice.model.Role;
import com.example.userservice.model.User;
import com.example.userservice.model.UserStatus;
import com.example.userservice.model.UserStatusCount;
import com.example.userservice.repository.RoleRepository;
import com.example.userservice.security.JwtUtil;
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
    private final ReportGrpcClient reportGrpcClient;
    private final ApplicationGrpcClient applicationGrpcClient;
    private final InternManagerService internManagerService;


    public UserController(UserService userService, RoleRepository roleRepo,ActivityGrpcClient activityGrpcClient, ProjectManagerGrpcClient projectManagerGrpcClient,ReportGrpcClient reportGrpcClient,InternManagerService internManagerService,ApplicationGrpcClient applicationGrpcClient) {
        this.userService = userService;
        this.roleRepo = roleRepo;
        this.activityGrpcClient = activityGrpcClient;
        this.projectManagerGrpcClient = projectManagerGrpcClient;
        this.reportGrpcClient=reportGrpcClient;
        this.applicationGrpcClient=applicationGrpcClient;
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
        String token = null;
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("access_token".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        if (token == null) {
            return ResponseEntity.status(401).body("Missing access_token cookie");
        }

        String role = (String)request.getAttribute("role");

        if (!"HR".equalsIgnoreCase(role) && !"PROJECT_MANAGER".equalsIgnoreCase(role)){
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only HR and PROJECT_MANAGER can access this resource"));
        }

        try {
            Pageable pageable = PageRequest.of(page, size);

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
            AllProjectResponses projects = projectManagerGrpcClient.getProjects(token, projectIds);

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

        String token = null;
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("access_token".equals(cookie.getName())) { // <-- replace "token" with your cookie name
                    token = cookie.getValue();
                    break;
                }
            }
        }

        if (token == null) {
            return ResponseEntity.status(401).body("Missing access_token cookie");
        }

        String role = (String) request.getAttribute("role");

        if (!"UNIVERSITY".equalsIgnoreCase(role)  ){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Only University can assign supervisor for student."));
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

    @PutMapping("/assign-project_manager")
    public ResponseEntity<?> assignProjectManager(
            @RequestBody AssignProjectManagerRequestDTO dto,
            HttpServletRequest request
    ) {

        String token = null;
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("access_token".equals(cookie.getName())) { // <-- replace "token" with your cookie name
                    token = cookie.getValue();
                    break;
                }
            }
        }

        if (token == null) {
            return ResponseEntity.status(401).body("Missing access_token cookie");
        }

        String role = (String) request.getAttribute("role");

        if (!"HR".equalsIgnoreCase(role)  ){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Only HR can assign_project manager for student."));
        }

        try {
            userService.assignProjectManager(dto);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Project_Manager assigned successfully!");
            response.put("Success", true);
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
    public ResponseEntity<?> getStudentDashboard(HttpServletRequest request, Pageable pageable) {
        Long userId = (Long) request.getAttribute("userId");
        String role =(String) request.getAttribute("role");
        if (!"HR".equalsIgnoreCase(role) && !"PROJECT_MANAGER".equalsIgnoreCase(role)){
            return ResponseEntity.status(403).body("Access denied");
        }

        String jwtToken = getJwtTokenFromRequest(request);

        if (jwtToken == null) {
            return ResponseEntity.status(401).body("Missing access_token cookie");
        }
        
        User user = userService.getUserById(userId);
        UserResponseDto fullUserDto = new UserResponseDto(user);
        UserSupervisorProjectManagerDTO userDto = new UserSupervisorProjectManagerDTO(fullUserDto);

        // Fetch data (fail-safe)
        Map<String, Object> reportStatus = fetchReportStatus(jwtToken, userId);
        List<ActivityDTO> recentActivities = fetchRecentActivities(jwtToken, userId, pageable);
        List<MilestoneResponse> milestones = fetchMilestones(jwtToken, userId);

        // Combine response
        Map<String, Object> response = new HashMap<>();
        response.put("message", "dashboard informations");
        response.put("reportStatus", reportStatus);
        response.put("recentActivities", recentActivities);
        response.put("infos",userDto);
        response.put("tasks", milestones);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/company/v1/dashboard")
    public ResponseEntity<?> getCompanyDashboard(HttpServletRequest request, Pageable pageable) {
        Long userId = (Long) request.getAttribute("userId");
        String role= (String) request.getAttribute("role");
        if("STUDENT".equalsIgnoreCase(role) || "ADMIN".equalsIgnoreCase(role)){
            return ResponseEntity.status(403).body("Access denied");

        }
        String jwtToken = getJwtTokenFromRequest(request);

        if (jwtToken == null) {
            return ResponseEntity.status(401).body("Missing access_token cookie");
        }
        
        // Fetch data (fail-safe)
        Map<String,Object> reportStatus=new HashMap<>();
        Map<String,Map<String,Object>> taskStatus=new HashMap<>();
        Map<String,Object> projects=new HashMap<>();

        Map<String,Object> apps = fetchAppsStatusForCompany(jwtToken);
        if("HR".equalsIgnoreCase(role)){
            reportStatus = fetchReportStatusForCompany(jwtToken,0L);
            projects = fetchProjectStatusForCompany(jwtToken,0L);
            taskStatus=fetchTasksForCompany(reportStatus,apps,projects);
        }else{
            reportStatus = fetchReportStatusForCompany(jwtToken, userId);
            projects = fetchProjectStatusForCompany(jwtToken,0L);
            taskStatus = fetchTasksForCompany(reportStatus,apps,projects);
        }
        List<ActivityDTO> recentActivities = fetchRecentActivities(jwtToken, userId, pageable);
        
        // Combine response
        Map<String, Object> response = new HashMap<>();
        response.put("message", "dashboard informations");
        response.put("ActiveIntern",countUserByStatus("STUDENT", UserStatus.ACTIVE));
        response.put("Application", apps.get("totalCount"));
        response.put("project",projects.get("totalActive"));
        response.put("report", reportStatus.get("totalPending"));
        response.put("recentActivities", recentActivities);
        response.put("tasks", taskStatus);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/company/v2/dashboard")
    public ResponseEntity<?> getTopInternsDashboard(HttpServletRequest request, Pageable pageable) {
        Long userId = (Long) request.getAttribute("userId");
        String role = (String) request.getAttribute("role");

        if ("STUDENT".equalsIgnoreCase(role) || "ADMIN".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body("Access denied");
        }

        String jwtToken = getJwtTokenFromRequest(request);
        if (jwtToken == null) {
            return ResponseEntity.status(401).body("Missing access_token cookie");
        }

        List<Map<String, Object>> response = new ArrayList<>();
        try {
            Map<Long, Double> datas = fetchTopStats(jwtToken, pageable.getPageNumber(), pageable.getPageSize());

            // Collect intern IDs
            List<Long> internIds = new ArrayList<>(datas.keySet());
            List<UserMessageDTO> users = userService.getUsersByIds(internIds);

            // Map intern → project
            List<InternManager> internInfos = internManagerService.getInfos(internIds);
            Map<Long, Long> internToProject = new HashMap<>();
            for (InternManager im : internInfos) {
                internToProject.put(im.getUser().getId(), im.getProject().getId());
            }

            // Fetch milestone stats
            List<Long> projectIds = new ArrayList<>(internToProject.values());
            MilestoneStatsResponse milestoneStatsResponse = projectManagerGrpcClient.getMilestoneStats(jwtToken, projectIds);

            // Map projectId -> plain milestone stats map
            Map<Long, Map<String, Object>> projectIdToStats = new HashMap<>();
            for (StatsResponse stats : milestoneStatsResponse.getStatsList()) {
                Map<String, Object> statsMap = new HashMap<>();
                statsMap.put("projectId", stats.getProjectId());
                statsMap.put("total", stats.getTotal());
                statsMap.put("completed", stats.getCompleted());
                projectIdToStats.put(stats.getProjectId(), statsMap);
            }

            // Build response per intern
            for (UserMessageDTO user : users) {
                Map<String, Object> temp = new HashMap<>();
                temp.put("rating", datas.get(user.getId()));
                temp.put("user", user);

                Long projectId = internToProject.get(user.getId());
                if (projectId != null) {
                    temp.put("milestoneStats", projectIdToStats.get(projectId));
                } else {
                    temp.put("milestoneStats", null);
                }

                response.add(temp);
            }

        } catch (Exception e) {
            e.printStackTrace();
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

    @GetMapping("/filter-supervisor-by-institution")
    public ResponseEntity<?> getSupervisorsByInstitution(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        // 🔑 Get JWT from cookie
       String token = null;
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("access_token".equals(cookie.getName())) { // <-- replace "token" with your cookie name
                    token = cookie.getValue();
                    break;
                }
            }
        }

        // 🔑 Extract role & id from token
        String role = (String)request.getAttribute("role");
        String institution = (String)request.getAttribute("institution");

        if (!"UNIVERSITY".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only universities can access this resource"));
        }

        Pageable pageable = PageRequest.of(page, size);

        Page<User> pageResult = userService.filterSupervisorByInstitution(institution, pageable);

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

     
    
    private int countUserByStatus(String role,UserStatus status){
        try{
            return userService.countByRoleAndUserStatus(role,status);
        }catch(Exception e){
            return 0;
        }
    }
    
    // Helper to extract JWT token from cookies
    private String getJwtTokenFromRequest(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("access_token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    // Fetch report status safely
    private Map<String, Object> fetchReportStatus(String jwtToken, Long userId) {
        Map<String, Object> status = new HashMap<>();
        try {
            ReportStatsResponse stats = reportGrpcClient.getReportStatsForUser(jwtToken, userId);
            status.put("totalReport", stats.getTotalReports());
            status.put("averageRating", stats.getAverageRating());
        } catch (Exception e) {
            status.put("totalReport", 0);
            status.put("averageRating", 0.0);
        }
        return status;
    }

    // Fetch top stats 
    private Map<Long, Double> fetchTopStats(String jwtToken, int page, int size) {
        Map<Long, Double> stats = new HashMap<>();
        try {
            TopInternsResponse topStats = reportGrpcClient.getTopInterns(jwtToken, page, size);
            if (topStats != null && topStats.getInternsCount() > 0) {
                for (TopInterns intern : topStats.getInternsList()) {
                    stats.put(intern.getUserId(), intern.getRating());
                }
            }
        } catch (Exception e) {
            // log error if needed
            stats = new HashMap<>();
            e.printStackTrace();
        }
        return stats;
}


    private Map<String, Object> fetchReportStatusForCompany(String jwtToken, Long userId) {
        Map<String, Object> status = new HashMap<>();
        if(userId==0){
            try {
                TotalReportResponse stats = reportGrpcClient.getReportStatsForHR(jwtToken);
                status.put("totalPending", stats.getTotalPendingReports());
                status.put("totalgiven", stats.getTotalResolvedReports());
            } catch (Exception e) {
                status.put("totalPending", 0);
                status.put("totalgiven", 0.0);
            }
        }else{
            try {
                TotalReportResponse stats = reportGrpcClient.getReportStatsForPM(jwtToken, userId);
                status.put("totalPending", stats.getTotalPendingReports());
                status.put("totalgiven", stats.getTotalResolvedReports());
            } catch (Exception e) {
                status.put("totalReport", 0);
                status.put("averageRating", 0.0);
            }

        } 
        return status;
    
    }
    private Map<String, Object> fetchProjectStatusForCompany(String jwtToken, Long userId) {
        Map<String, Object> status = new HashMap<>();
        if(userId==0){
            try {
                ProjectStatsResponse stats = projectManagerGrpcClient.getProjectStatsForHR(jwtToken);
                status.put("totalActive", stats.getActive());
                status.put("totalPanning", stats.getPlanning());
                status.put("totalCompleted", stats.getCompleted());
                status.put("total", stats.getTotal());
            } catch (Exception e) {
                status.put("totalActive", 0);
                status.put("totalPanning", 0);
                status.put("totalCompleted", 0);
                status.put("total", 0);
            }
        }else{
            try {
                ProjectStatsResponse stats = projectManagerGrpcClient.getProjectStatsForPM(jwtToken,userId);
                status.put("totalActive", stats.getActive());
                status.put("totalPanning", stats.getPlanning());
                status.put("totalCompleted", stats.getCompleted());
                status.put("total", stats.getTotal());
            } catch (Exception e) {
                status.put("totalActive", 0);
                status.put("totalPanning", 0);
                status.put("totalCompleted", 0);
                status.put("total", 0);    
            }

        } 
        return status;
    
    }

    private Map<String, Object> fetchAppsStatusForCompany(String jwtToken) {
        Map<String, Object> status = new HashMap<>();
        try {
            ApplicationCountResponse stats = applicationGrpcClient.getApplicationStats(jwtToken);
            status.put("totalAccepted", stats.getAccepted());
            status.put("totalRejected", stats.getRejected());
            status.put("totalPending", stats.getPending());
            status.put("totalCount", stats.getCount());
        
        } catch (Exception e) {
            status.put("totalAccepted", 0);
            status.put("totalRejected", 0);
            status.put("totalPending", 0);
            status.put("totalCount", 0);
        }
        return status;
    
    }
    private Map<String, Map<String, Object>> fetchTasksForCompany(
            Map<String, Object> status,
            Map<String, Object> apps,
            Map<String, Object> projects) {
        
        Map<String, Map<String, Object>> response = new HashMap<>();

        // Reports
        Long totalPendingReports = ((Number) status.getOrDefault("totalPending", 0L)).longValue();
        if (totalPendingReports > 0) {
            Map<String, Object> tasksForReports = new HashMap<>();
            tasksForReports.put("description", "Evaluate weekly reports");
            tasksForReports.put("totalPending", totalPendingReports);
            tasksForReports.put("priority", "coming soon");
            response.put("tasksForReports", tasksForReports);
        }

        // Applications
        Long totalPendingApps = ((Number) apps.getOrDefault("totalPending", 0L)).longValue();
        if (totalPendingApps > 0) {
            Map<String, Object> tasksForApps = new HashMap<>();
            tasksForApps.put("description", "Review pending applications");
            tasksForApps.put("totalPending", totalPendingApps);
            tasksForApps.put("priority", "coming soon");
            response.put("tasksForApps", tasksForApps);
        }

        // Projects
        Long totalPlanningProjects = ((Number) projects.getOrDefault("totalPlanning", 0L)).longValue();
        if (totalPlanningProjects > 0) {
            Map<String, Object> tasksForProjects = new HashMap<>();
            tasksForProjects.put("description", "Complete planned projects");
            tasksForProjects.put("totalPlanning", totalPlanningProjects);
            tasksForProjects.put("priority", "coming soon");
            response.put("tasksForProjects", tasksForProjects);
        }

        return response;
}

    // Fetch recent activities safely
    private List<ActivityDTO> fetchRecentActivities(String jwtToken, Long userId, Pageable pageable) {
        try {
            GetRecentActivitiesResponse grpcResponse =
                    activityGrpcClient.getRecentActivities(jwtToken, userId, pageable.getPageNumber(), pageable.getPageSize());

            return grpcResponse.getActivitiesList().stream()
                    .map(a -> new ActivityDTO(
                            a.getId(),
                            a.getUserId(),
                            a.getTitle(),
                            a.getDescription(),
                            LocalDateTime.parse(a.getCreatedAt())
                    ))
                    .toList();
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    // Fetch milestones safely
    private List<MilestoneResponse> fetchMilestones(String jwtToken, Long userId) {
        List<MilestoneResponse> milestoneDTOs = new ArrayList<>();
        try {
            InternManagerResponseDTO internDTO = internManagerService.getInfoIdByUserId(userId);
            if (internDTO != null && internDTO.getProjectId() != null) {
                AllMilestones activeMilestones = projectManagerGrpcClient.getActiveMilestones(jwtToken, internDTO.getProjectId());
                if (activeMilestones != null) {
                    milestoneDTOs = activeMilestones.getMilestonesList().stream()
                            .map(m -> new MilestoneResponse(
                                    m.getMilestoneId(),
                                    m.getMilestoneTitle(),
                                    m.getMilestoneDescription(),
                                    m.getMilestoneStatus(),
                                    m.hasMilestoneDueDate() ? LocalDateTime.ofInstant(
                                            Instant.ofEpochSecond(m.getMilestoneDueDate().getSeconds(), m.getMilestoneDueDate().getNanos()),
                                            ZoneId.systemDefault()
                                    ) : null,
                                    m.hasMilestoneCreatedAt() ? LocalDateTime.ofInstant(
                                            Instant.ofEpochSecond(m.getMilestoneCreatedAt().getSeconds(), m.getMilestoneCreatedAt().getNanos()),
                                            ZoneId.systemDefault()
                                    ) : null
                            ))
                            .toList();
                }
            }
        } catch (Exception e) {
            // return empty list if any error
        }
        return milestoneDTOs;
    }


}
