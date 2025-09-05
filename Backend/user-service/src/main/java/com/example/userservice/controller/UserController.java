package com.example.userservice.controller;

import com.example.activity_service.gRPC.GetAllActivitiesResponse;
import com.example.activity_service.gRPC.GetRecentActivitiesResponse;
import com.example.application_service.gRPC.ApplicationCountResponse;
import com.example.project_service.gRPC.AllMilestones;
import com.example.project_service.gRPC.AllProjectResponses;
import com.example.project_service.gRPC.MilestoneStats;
import com.example.project_service.gRPC.MilestoneStatsResponse;
import com.example.project_service.gRPC.ProjectResponse;
import com.example.project_service.gRPC.ProjectStatsResponse;
import com.example.project_service.gRPC.StatsResponse;
import com.example.report_service.gRPC.ReportProgressResponse;
import com.example.report_service.gRPC.ReportStatsRequest;
import com.example.report_service.gRPC.ReportStatsResponse;
import com.example.report_service.gRPC.SingleProgress;
import com.example.report_service.gRPC.TopInterns;
import com.example.report_service.gRPC.TopInternsResponse;
import com.example.report_service.gRPC.TotalReportResponse;
import com.example.report_service.gRPC.UserUniversityStats;
import com.example.report_service.gRPC.UserUniversityStatsResponse;
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
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final RoleRepository roleRepo;
    private final ActivityGrpcClient activityGrpcClient;
    private final ApplicationGrpcClient applicationGrpcClient;
    private final ProjectManagerGrpcClient projectManagerGrpcClient;
    private final ReportGrpcClient reportGrpcClient;
    private final InternManagerService internManagerService;

    public UserController(UserService userService, RoleRepository roleRepo, ActivityGrpcClient activityGrpcClient,
            ProjectManagerGrpcClient projectManagerGrpcClient, ReportGrpcClient reportGrpcClient,
            InternManagerService internManagerService, ApplicationGrpcClient applicationGrpcClient) {
        this.userService = userService;
        this.roleRepo = roleRepo;
        this.activityGrpcClient = activityGrpcClient;
        this.applicationGrpcClient = applicationGrpcClient;
        this.projectManagerGrpcClient = projectManagerGrpcClient;
        this.reportGrpcClient = reportGrpcClient;
        this.internManagerService = internManagerService;

    }

    @GetMapping("/performance/filter")
    public ResponseEntity<?> computeFilter(HttpServletRequest request, @RequestParam String filter, Pageable pageable) {
        try {
            String role = (String) request.getAttribute("role");
            if (role == null || (!"supervisor".equalsIgnoreCase(role) && !"university".equalsIgnoreCase(role))) {
                return errorResponse("Unauthorized: Only supervisor and uni can access university.");
            }
            String institution = (String) request.getAttribute("institution");

            // 0. get data from cookie
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

            // 1. Fetch paginated users
            Page<User> usersPage = userService.findByRoleAndInstitutionAndSupervisorName(institution, filter, pageable);
            List<User> users = usersPage.getContent();

            List<Long> userIds = users.stream().map(User::getId).collect(Collectors.toList());

            // 2. Call gRPC to get stats for all users in this page
            UserUniversityStatsResponse userStatsList = reportGrpcClient.getUserUniversityStats(jwtToken, userIds);

            // Map stats by userId
            Map<Long, UserUniversityStats> statsMap = userStatsList.getStatsList().stream()
                    .collect(Collectors.toMap(UserUniversityStats::getUserId, s -> s));

            // 3. Build UserPerformanceDTO list
            List<UserPerformanceDTO> performanceList = new ArrayList<>();
            for (User user : users) {
                UserUniversityStats stats = statsMap.get(user.getId());

                int attendance = 95; // mock value
                String grade = "N/A";
                String performanceLabel = "N/A";

                if (stats != null && stats.hasLastReview()) {
                    int lastRating = stats.getLastReview().getRating();
                    if (lastRating >= 4.5) {
                        grade = "A";
                        performanceLabel = "Excellent";
                    } else if (lastRating >= 3.5) {
                        grade = "B";
                        performanceLabel = "Very Good";
                    } else if (lastRating >= 2.5) {
                        grade = "C";
                        performanceLabel = "Good";
                    } else {
                        grade = "D";
                        performanceLabel = "Needs Improvement";
                    }
                }

                UserPerformanceDTO dto = new UserPerformanceDTO();
                dto.setUserId(user.getId());
                dto.setFullName(user.getFirstName() + " " + user.getLastName());
                dto.setSupervisorName(user.getSupervisor() != null
                        ? user.getSupervisor().getFirstName() + " " + user.getSupervisor().getLastName()
                        : "N/A");
                dto.setAttendance(attendance);
                dto.setTotalReports(stats != null ? stats.getTotalReports() : 0);
                dto.setLastReviewFeedback(
                        stats != null && stats.hasLastReview() ? stats.getLastReview().getFeedback() : "N/A");
                dto.setLastReviewTime(
                        stats != null && stats.hasLastReview() ? stats.getLastReview().getCreatedAt() : "N/A");
                dto.setLastRating(stats != null && stats.hasLastReview() ? stats.getLastReview().getRating() : 0);
                dto.setGrade(grade);
                dto.setPerformanceLabel(performanceLabel);

                performanceList.add(dto);
            }

            // 4. Build paginated response
            PagedUserPerformanceDTO pagedResponse = new PagedUserPerformanceDTO();
            pagedResponse.setUsers(performanceList);
            pagedResponse.setPageNumber(usersPage.getNumber());
            pagedResponse.setPageSize(usersPage.getSize());
            pagedResponse.setTotalElements(usersPage.getTotalElements());
            pagedResponse.setTotalPages(usersPage.getTotalPages());

            return ResponseEntity.ok(pagedResponse);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error computing performance: " + e.getMessage());
        }
    }

    @GetMapping("/performance/search")
    public ResponseEntity<?> computeSearch(HttpServletRequest request, @RequestParam String keyword,
            Pageable pageable) {
        try {
            String role = (String) request.getAttribute("role");
            if (role == null || (!"supervisor".equalsIgnoreCase(role) && !"university".equalsIgnoreCase(role))) {
                return errorResponse("Unauthorized: Only supervisor and uni can access university.");
            }

            String institution = (String) request.getAttribute("institution");

            // 0. get data from cookie
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

            // 1. Fetch paginated users
            Page<User> usersPage = userService.searchByRoleInstitutionAndKeyword(institution, keyword, pageable);
            List<User> users = usersPage.getContent();

            List<Long> userIds = users.stream().map(User::getId).collect(Collectors.toList());

            // 2. Call gRPC to get stats for all users in this page
            UserUniversityStatsResponse userStatsList = reportGrpcClient.getUserUniversityStats(jwtToken, userIds);

            // Map stats by userId
            Map<Long, UserUniversityStats> statsMap = userStatsList.getStatsList().stream()
                    .collect(Collectors.toMap(UserUniversityStats::getUserId, s -> s));

            // 3. Build UserPerformanceDTO list
            List<UserPerformanceDTO> performanceList = new ArrayList<>();
            for (User user : users) {
                UserUniversityStats stats = statsMap.get(user.getId());

                int attendance = 95; // mock value
                String grade = "N/A";
                String performanceLabel = "N/A";

                if (stats != null && stats.hasLastReview()) {
                    int lastRating = stats.getLastReview().getRating();
                    if (lastRating >= 4.5) {
                        grade = "A";
                        performanceLabel = "Excellent";
                    } else if (lastRating >= 3.5) {
                        grade = "B";
                        performanceLabel = "Very Good";
                    } else if (lastRating >= 2.5) {
                        grade = "C";
                        performanceLabel = "Good";
                    } else {
                        grade = "D";
                        performanceLabel = "Needs Improvement";
                    }
                }

                UserPerformanceDTO dto = new UserPerformanceDTO();
                dto.setUserId(user.getId());
                dto.setFullName(user.getFirstName() + " " + user.getLastName());
                dto.setSupervisorName(user.getSupervisor() != null
                        ? user.getSupervisor().getFirstName() + " " + user.getSupervisor().getLastName()
                        : "N/A");
                dto.setAttendance(attendance);
                dto.setTotalReports(stats != null ? stats.getTotalReports() : 0);
                dto.setLastReviewFeedback(
                        stats != null && stats.hasLastReview() ? stats.getLastReview().getFeedback() : "N/A");
                dto.setLastReviewTime(
                        stats != null && stats.hasLastReview() ? stats.getLastReview().getCreatedAt() : "N/A");
                dto.setLastRating(stats != null && stats.hasLastReview() ? stats.getLastReview().getRating() : 0);
                dto.setGrade(grade);
                dto.setPerformanceLabel(performanceLabel);

                performanceList.add(dto);
            }

            // 4. Build paginated response
            PagedUserPerformanceDTO pagedResponse = new PagedUserPerformanceDTO();
            pagedResponse.setUsers(performanceList);
            pagedResponse.setPageNumber(usersPage.getNumber());
            pagedResponse.setPageSize(usersPage.getSize());
            pagedResponse.setTotalElements(usersPage.getTotalElements());
            pagedResponse.setTotalPages(usersPage.getTotalPages());

            return ResponseEntity.ok(pagedResponse);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error computing performance: " + e.getMessage());
        }
    }

    @GetMapping("/performance/stat")
    public ResponseEntity<?> computeDashboard(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page, // page number, default 0
            @RequestParam(defaultValue = "100") int size // page size, default 10
    ) {
        try {
            String role = (String) request.getAttribute("role");
            if (role == null || (!"supervisor".equalsIgnoreCase(role) && !"university".equalsIgnoreCase(role))) {
                return errorResponse("Unauthorized: Only supervisor and uni can access university.");
            }
            String institution = (String) request.getAttribute("institution");

            // Create Pageable dynamically from request params
            Pageable pageable = PageRequest.of(page, size);

            // 0. get data from cookie
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

            // 1. Fetch paginated users
            Page<User> usersPage = userService.getInternsForUniveristy(institution, pageable);
            List<User> users = usersPage.getContent();

            // 2. Collect user IDs
            List<Long> userIds = users.stream().map(User::getId).collect(Collectors.toList());

            // 3. Fetch intern-manager info
            List<InternManager> internManagers = internManagerService.getInfos(userIds);

            // 4. Collect project IDs
            List<Long> projectIds = internManagers.stream()
                    .map(im -> im.getProject() != null ? im.getProject().getId() : null)
                    .filter(Objects::nonNull) // remove nulls
                    .collect(Collectors.toList());

            // 5. Call gRPC clients to fetch milestone stats & report stats
            MilestoneStats milestoneStats = projectManagerGrpcClient.getMilestoneStatsForUnivseristy(jwtToken,
                    projectIds);
            ReportStatsResponse reportStats = reportGrpcClient.getReportStatsForUniversity(jwtToken, userIds);

            // 6. Build final DTO
            DashboardStatDTO dashboardStat = new DashboardStatDTO();
            dashboardStat.setTotalReports(reportStats.getTotalReports());
            dashboardStat.setAverageRating(reportStats.getAverageRating());
            dashboardStat.setScore(milestoneStats.getTotal() > 0
                    ? (double) milestoneStats.getCompleted() / milestoneStats.getTotal()
                    : 0.0);
            dashboardStat.setAttendance(95); // Mocked

            return ResponseEntity.ok(dashboardStat);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error computing dashboard stats: " + e.getMessage());
        }
    }

    @GetMapping("/performance")
    public ResponseEntity<?> computePerformance(HttpServletRequest request, Pageable pageable) {
        try {
            String role = (String) request.getAttribute("role");

            if (role == null || (!"supervisor".equalsIgnoreCase(role) && !"university".equalsIgnoreCase(role))) {
                return errorResponse("Unauthorized: Only supervisor and uni can access university.");
            }
            String institution = (String) request.getAttribute("institution");

            // 0. get data from cookie
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

            // 1. Fetch paginated users
            Page<User> usersPage = userService.filterByInstitution(institution, pageable);
            System.out.println("========================" + usersPage);
            List<User> users = usersPage.getContent();

            List<Long> userIds = users.stream().map(User::getId).collect(Collectors.toList());
            System.out.println("========================" + userIds);

            // 2. Call gRPC to get stats for all users in this page
            UserUniversityStatsResponse userStatsList = reportGrpcClient.getUserUniversityStats(jwtToken, userIds);

            // Map stats by userId
            Map<Long, UserUniversityStats> statsMap = userStatsList.getStatsList().stream()
                    .collect(Collectors.toMap(UserUniversityStats::getUserId, s -> s));

            // 3. Build UserPerformanceDTO list
            List<UserPerformanceDTO> performanceList = new ArrayList<>();
            for (User user : users) {
                UserUniversityStats stats = statsMap.get(user.getId());

                int attendance = 95; // mock value
                String grade = "N/A";
                String performanceLabel = "N/A";

                if (stats != null && stats.hasLastReview()) {
                    int lastRating = stats.getLastReview().getRating();
                    if (lastRating >= 4.5) {
                        grade = "A";
                        performanceLabel = "Excellent";
                    } else if (lastRating >= 3.5) {
                        grade = "B";
                        performanceLabel = "Very Good";
                    } else if (lastRating >= 2.5) {
                        grade = "C";
                        performanceLabel = "Good";
                    } else {
                        grade = "D";
                        performanceLabel = "Needs Improvement";
                    }
                }

                UserPerformanceDTO dto = new UserPerformanceDTO();
                dto.setUserId(user.getId());
                dto.setFullName(user.getFirstName() + " " + user.getLastName());
                dto.setSupervisorName(user.getSupervisor() != null
                        ? user.getSupervisor().getFirstName() + " " + user.getSupervisor().getLastName()
                        : "N/A");
                dto.setAttendance(attendance);
                dto.setTotalReports(stats != null ? stats.getTotalReports() : 0);
                dto.setLastReviewFeedback(
                        stats != null && stats.hasLastReview() ? stats.getLastReview().getFeedback() : "N/A");
                dto.setLastReviewTime(
                        stats != null && stats.hasLastReview() ? stats.getLastReview().getCreatedAt() : "N/A");
                dto.setLastRating(stats != null && stats.hasLastReview() ? stats.getLastReview().getRating() : 0);
                dto.setGrade(grade);
                dto.setPerformanceLabel(performanceLabel);

                performanceList.add(dto);
            }

            // 4. Build paginated response
            PagedUserPerformanceDTO pagedResponse = new PagedUserPerformanceDTO();
            pagedResponse.setUsers(performanceList);
            pagedResponse.setPageNumber(usersPage.getNumber());
            pagedResponse.setPageSize(usersPage.getSize());
            pagedResponse.setTotalElements(usersPage.getTotalElements());
            pagedResponse.setTotalPages(usersPage.getTotalPages());

            return ResponseEntity.ok(pagedResponse);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error computing performance: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        // get role----only admin can do this
        try {
            String token = extractAccessToken(request);
            if (token == null) {
                return ResponseEntity.status(401).body("Missing access_token cookie");
            }

            String role = (String) request.getAttribute("role");
            if (!"ADMIN".equalsIgnoreCase(role)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Collections.singletonMap("message", "Unauthorized: Only Admin can get all users"));
            }

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
    public ResponseEntity<?> deleteUserById(@PathVariable Long id, HttpServletRequest request) {
        try {
            String token = extractAccessToken(request);
            if (token == null) {
                return ResponseEntity.status(401).body("Missing access_token cookie");
            }

            String role = (String) request.getAttribute("role");

            if (!"ADMIN".equalsIgnoreCase(role)) {
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
    public ResponseEntity<?> getUserById(HttpServletRequest request, @PathVariable Long id) {
        try {
            String token = extractAccessToken(request);
            if (token == null) {
                return ResponseEntity.status(401).body("Missing access_token cookie");
            }
            User user = userService.getUserById(id);
            return ResponseEntity.ok(new UserResponseDto(user));
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(400).body(error);
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getUser(HttpServletRequest request) {
        try {
            String token = extractAccessToken(request);
            if (token == null) {
                return ResponseEntity.status(401).body("Missing access_token cookie");
            }
            Long userId = (Long) request.getAttribute("userId");
            User user = userService.getUserById(userId);
            return ResponseEntity.ok(new UserResponseDto(user));
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(400).body(error);
        }
    }

    @PutMapping("/update-password")
    public ResponseEntity<?> updatePassword(@RequestBody UpdatePasswordDTO dto, HttpServletRequest request) {

        try {
            String token = extractAccessToken(request);
            if (token == null) {
                return ResponseEntity.status(401).body("Missing access_token cookie");
            }
            Long userId = (Long) request.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.status(401).body("User ID not found in token");
            }

            userService.updateUserPassword(userId, dto);
            return ResponseEntity.ok("Password updated successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping
    public ResponseEntity<?> updateUserProfile(@RequestBody User user, HttpServletRequest request) {
        try {
            // get user id and role from request
            String token = extractAccessToken(request);
            if (token == null) {
                return ResponseEntity.status(401).body("Missing access_token cookie");
            }
            Long userId = (Long) request.getAttribute("userId");
            String role = (String) request.getAttribute("role");

            User updatedUser = userService.updateUser(userId, user);

            // log activity
            // logActivity( userId, "for " + updatedUser.getFirstName() + " " +
            // updatedUser.getLastName()+ "profile update");
            return ResponseEntity.ok(new UserResponseDto(updatedUser));
        } catch (Exception e) {
            // You can customize error response here
            return ResponseEntity
                    .badRequest()
                    .body("Failed to update user: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> adminUpdateUserProfile(@PathVariable Long id, @RequestBody User user,
            HttpServletRequest request) {
        try {
            // get user id and role from request
            String token = extractAccessToken(request);
            if (token == null) {
                return ResponseEntity.status(401).body("Missing access_token cookie");
            }

            String role = (String) request.getAttribute("role");
            if (!"ADMIN".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized.");
            }
            if (!"PROJECT_MANAGER".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized.");
            }
            if (!"HR".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized.");
            }
            if (!"STUDENT".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized.");
            }

            User updatedUser = userService.updateUser(userId, user);

            // log activity
            // logActivity( userId, "for " + updatedUser.getFirstName() + " " +
            // updatedUser.getLastName()+ "profile update");
            return ResponseEntity.ok(new UserResponseDto(updatedUser));
        } catch (Exception e) {
            // You can customize error response here
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("an error occurred: " + e.getMessage());
        }
    }

    @GetMapping("/interns")
    public ResponseEntity<?> getInterns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {

        String token = extractAccessToken(request);
        if (token == null) {
            return ResponseEntity.status(401).body("Missing access_token cookie");
        }

        String role = (String) request.getAttribute("role");

        if (!"HR".equalsIgnoreCase(role) && !"PROJECT_MANAGER".equalsIgnoreCase(role)) {
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
                            p -> new ProjectDTO(p.getProjectId(), p.getProjectName(), p.getProjectDescription(),
                                    p.getProgress())));

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
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/assign-supervisor")
    public ResponseEntity<?> assignSupervisor(
            @RequestBody AssignSupervisorRequestDTO dto,
            HttpServletRequest request) {

        String token = extractAccessToken(request);
        if (token == null) {
            return ResponseEntity.status(401).body("Missing access_token cookie");
        }

        String role = (String) request.getAttribute("role");

        if (!"UNIVERSITY".equalsIgnoreCase(role)) {
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
            HttpServletRequest request) {
        String token = extractAccessToken(request);
        if (token == null) {
            return ResponseEntity.status(401).body("Missing access_token cookie");
        }

        String role = (String) request.getAttribute("role");

        if (!"HR".equalsIgnoreCase(role)) {
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

    // fix: this one
    // fixed this one
    @GetMapping("/supervisors")
    public ResponseEntity<?> getSupervisors(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        String token = extractAccessToken(request);
        if (token == null) {
            return ResponseEntity.status(401).body("Missing access_token cookie");
        }

        String institution = (String) request.getAttribute("institution");
        String role = (String) request.getAttribute("role");

        if (!"UNIVERSITY".equalsIgnoreCase(role) && !"SUPERVISOR".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Only University and Supervisor can get this resource!"));
        }

        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<User> pageResult = userService.filterSupervisorByInstitution(institution, pageable);

            List<SupervisorDTO> content = pageResult.getContent().stream()
                    .map(supervisor -> {
                        SupervisorDTO dto = new SupervisorDTO(supervisor);
                        dto.setSupervisedInterns(supervisor.getSupervisedInterns());
                        return dto;
                    })
                    .toList();

            return ResponseEntity.ok(Map.of(
                    "content", content,
                    "currentPage", pageResult.getNumber(),
                    "totalPages", pageResult.getTotalPages(),
                    "totalElements", pageResult.getTotalElements()));

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
            String token = extractAccessToken(request);
            if (token == null) {
                return ResponseEntity.status(401).body("Missing access_token cookie");
            }

            String role = (String) request.getAttribute("role");

            if (!"ADMIN".equalsIgnoreCase(role)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Only HR can assign_project manager for student."));
            }

            if (resetRequest.getNewPassword() == null || resetRequest.getNewPassword().length() < 6) {
                return errorResponse("New password must be at least 6 characters long.");
            }

            User updatedUser = userService.adminResetUserPassword(
                    resetRequest.getTargetUserEmail(),
                    resetRequest.getNewPassword());

            Map<String, String> response = new HashMap<>();
            response.put("message",
                    "Password for user " + updatedUser.getEmail() + " has been successfully reset by admin.");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    @GetMapping("/student/dashboard")
    public ResponseEntity<?> getStudentDashboard(HttpServletRequest request, Pageable pageable) {
        Long userId = (Long) request.getAttribute("userId");
        String role = (String) request.getAttribute("role");
        if (!"STUDENT".equalsIgnoreCase(role)) {
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
        response.put("infos", userDto);
        response.put("tasks", milestones);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/company/v1/dashboard")
    public ResponseEntity<?> getCompanyDashboard(HttpServletRequest request, Pageable pageable) {
        Long userId = (Long) request.getAttribute("userId");
        String role = (String) request.getAttribute("role");
        if ("STUDENT".equalsIgnoreCase(role) || "ADMIN".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body("Access denied");

        }
        String jwtToken = getJwtTokenFromRequest(request);

        if (jwtToken == null) {
            return ResponseEntity.status(401).body("Missing access_token cookie");
        }

        // Fetch data (fail-safe)
        Map<String, Object> reportStatus = new HashMap<>();
        Map<String, Map<String, Object>> taskStatus = new HashMap<>();
        Map<String, Object> projects = new HashMap<>();

        Map<String, Object> apps = fetchAppsStatusForCompany(jwtToken);
        if ("HR".equalsIgnoreCase(role)) {
            reportStatus = fetchReportStatusForCompany(jwtToken, 0L);
            projects = fetchProjectStatusForCompany(jwtToken, 0L);
            taskStatus = fetchTasksForCompany(reportStatus, apps, projects);
        } else {
            reportStatus = fetchReportStatusForCompany(jwtToken, userId);
            projects = fetchProjectStatusForCompany(jwtToken, 0L);
            taskStatus = fetchTasksForCompany(reportStatus, apps, projects);
        }
        List<ActivityDTO> recentActivities = fetchRecentActivities(jwtToken, userId, pageable);

        // Combine response
        Map<String, Object> response = new HashMap<>();
        response.put("message", "dashboard informations");
        response.put("ActiveIntern", countUserByStatus("STUDENT", UserStatus.ACTIVE));
        response.put("Application", apps.get("totalCount"));
        response.put("project", projects.get("totalActive"));
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
            MilestoneStatsResponse milestoneStatsResponse = projectManagerGrpcClient.getMilestoneStats(jwtToken,
                    projectIds);

            // Map projectId -> plain milestone stats map
            Map<Long, Map<String, Object>> projectIdToStats = new HashMap<>();
            for (StatsResponse stats : milestoneStatsResponse.getStatsList()) {
                Map<String, Object> statsMap = new HashMap<>();
                statsMap.put("completed", stats.getCompleted() / stats.getTotal() * 100);
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

    @GetMapping("/admin/dashboard")
    public ResponseEntity<?> getAdminDashboard(HttpServletRequest request, Pageable pageable) {
        try {
            String token = extractAccessToken(request);
            if (token == null) {
                return ResponseEntity.status(401).body("Missing access_token cookie");
            }

            String role = (String) request.getAttribute("role");

            if (!"ADMIN".equalsIgnoreCase(role)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Only Admin can access admin dashboard."));
            }

            UserStatsResponse userStats = userService.userStats();

            GetAllActivitiesResponse grpcResponse = activityGrpcClient.getAllActivities(token, pageable.getPageNumber(),
                    pageable.getPageSize());

            // 5️⃣ Map protobuf response to DTOs
            List<ActivityDTO> allActivities = grpcResponse.getActivitiesList().stream()
                    .map(a -> new ActivityDTO(
                            a.getId(),
                            a.getUserId(),
                            a.getTitle(),
                            a.getDescription(),
                            LocalDateTime.parse(a.getCreatedAt())))
                    .toList();

            Map<String, Object> combinedResponse = new HashMap<>();
            combinedResponse.put("userStats", userStats);
            combinedResponse.put("allActivities", allActivities);

            return ResponseEntity.ok(combinedResponse);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An internal error occurred while gettting Admin Dashboard!");
        }
    }

    @GetMapping("/university/dashboard")
    public ResponseEntity<?> getUniversityDashboard(HttpServletRequest request, Pageable pageable) {

        String token = extractAccessToken(request);
        if (token == null) {
            return ResponseEntity.status(401).body("Missing access_token cookie");
        }

        String role = (String) request.getAttribute("role");

        if (!"UNIVERSITY".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Only University can get university dashboard."));
        }

        // 2️⃣ Get userId from request attribute
        Long userId = (Long) request.getAttribute("userId");

        InternStatusesCount internStatusesCount = userService.countInternStatuses();
        long supervisorCount = userService.countSupervisor();

        // 4️⃣ Fetch recent activities from gRPC
        GetRecentActivitiesResponse grpcResponse = activityGrpcClient.getRecentActivities(token, userId,
                pageable.getPageNumber(), pageable.getPageSize());

        // 5️⃣ Map protobuf response to DTOs
        List<ActivityDTO> activityList = grpcResponse.getActivitiesList().stream()
                .map(a -> new ActivityDTO(
                        a.getId(),
                        a.getUserId(),
                        a.getTitle(),
                        a.getDescription(),
                        LocalDateTime.parse(a.getCreatedAt())))
                .toList();

        // 7️⃣ Combine into single response
        Map<String, Object> combinedResponse = new HashMap<>();
        combinedResponse.put("internStatusesCount", internStatusesCount);
        combinedResponse.put("supervisorCount", supervisorCount);
        combinedResponse.put("recentActivities", activityList);

        return ResponseEntity.ok(combinedResponse);
    }

    @GetMapping("/role-count")
    public ResponseEntity<?> getUserRoleCounts(HttpServletRequest request) {
        String token = extractAccessToken(request);
        if (token == null) {
            return ResponseEntity.status(401).body("Missing access_token cookie");
        }

        String role = (String) request.getAttribute("role");

        if (!"HR".equalsIgnoreCase(role) && !"ADMIN".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Only HR can assign_project manager for student."));
        }
        Map<String, Long> roleCounts = userService.getUserRoleCounts();
        return ResponseEntity.ok(roleCounts);
    }

    @GetMapping("/status-count")
    public ResponseEntity<?> getAllUserStatusCount(HttpServletRequest request) {
        String token = extractAccessToken(request);
        if (token == null) {
            return ResponseEntity.status(401).body("Missing access_token cookie");
        }

        List<UserStatusCount> roleCounts = userService.countUsersByStatus();
        Long totalUser = userService.countAllUsers();

        Map<String, Long> statusMap = roleCounts.stream()
                .collect(Collectors.toMap(
                        item -> item.getUserStatus().toString(), // Convert enum to String
                        UserStatusCount::getCount));

        // Map<String, Object> response = Map.of("statuses", statusMap);

        Map<String, Object> combinedResponse = new HashMap<>();
        combinedResponse.put("totalUser", totalUser);
        combinedResponse.put("statuses", statusMap);

        return ResponseEntity.ok(combinedResponse);
    }

    @GetMapping("/interns/search")
    public ResponseEntity<?> searchApplicants(
            HttpServletRequest request,
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String token = extractAccessToken(request);
        if (token == null) {
            return ResponseEntity.status(401).body("Missing access_token cookie");
        }

        String role = (String) request.getAttribute("role");
        String institution = (String) request.getAttribute("institution");

        if (!"HR".equalsIgnoreCase(role) && !"PROJECT_MANAGER".equalsIgnoreCase(role)
                && !"UNIVERSITY".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Only HR and PM can  access this resource."));
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<User> pageResult = userService.searchInterns(query, institution, pageable);

        List<UserResponseDto> content = pageResult.getContent().stream()
                .map(this::mapToDTO)
                .toList();

        return ResponseEntity.ok(Map.of(
                "content", content,
                "currentPage", pageResult.getNumber(),
                "totalPages", pageResult.getTotalPages(),
                "totalElements", pageResult.getTotalElements()));
    }

    @GetMapping("/supervisors/search")
    public ResponseEntity<?> searchSupervisors(
            HttpServletRequest request,
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            String token = extractAccessToken(request);
            if (token == null) {
                return ResponseEntity.status(401).body("Missing access_token cookie");
            }

            String role = (String) request.getAttribute("role");

            if (!"UNIVERSITY".equalsIgnoreCase(role)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Only University can access this resource."));
            }

            String institution = (String) request.getAttribute("role");
            Pageable pageable = PageRequest.of(page, size);
            Page<User> pageResult = userService.searchSupervisors(query, institution, pageable);

            List<UserResponseDto> content = pageResult.getContent().stream()
                    .map(this::mapToDTO)
                    .toList();

            return ResponseEntity.ok(Map.of(
                    "content", content,
                    "currentPage", pageResult.getNumber(),
                    "totalPages", pageResult.getTotalPages(),
                    "totalElements", pageResult.getTotalElements()));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "An unexpected error occurred",
                            "details", e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(
            HttpServletRequest request,
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        String token = extractAccessToken(request);
        if (token == null) {
            return ResponseEntity.status(401).body("Missing access_token cookie");
        }

        String role = (String) request.getAttribute("role");
        Pageable pageable = PageRequest.of(page, size);
        Page<User> pageResult = userService.searchUsers(query, pageable);

        List<UserResponseDto> content = pageResult.getContent().stream()
                .map(this::mapToDTO)
                .toList();

        return ResponseEntity.ok(Map.of(
                "content", content,
                "currentPage", pageResult.getNumber(),
                "totalPages", pageResult.getTotalPages(),
                "totalElements", pageResult.getTotalElements()));
    }

    @GetMapping("/filter-interns-by-university")
    public ResponseEntity<?> filterInternByUniversity(
            HttpServletRequest request,
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            String token = extractAccessToken(request);
            if (token == null) {
                return ResponseEntity.status(401).body("Missing access_token cookie");
            }

            String role = (String) request.getAttribute("role");

            if (!"HR".equalsIgnoreCase(role) && !"PROJECT_MANAGER".equalsIgnoreCase(role)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Only HR and PM can access this resource"));
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
                    "totalElements", pageResult.getTotalElements()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while intern by university");
        }
    }

    @GetMapping("/get-student-for-university")
    public ResponseEntity<?> filterInternForUniversity(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            String token = extractAccessToken(request);
            String institution = (String) request.getAttribute("institution");
            if (token == null) {
                return ResponseEntity.status(401).body("Missing access_token cookie");
            }

            String role = (String) request.getAttribute("role");

            if (!"UNIVERSITY".equalsIgnoreCase(role) && !"SUPERVISOR".equalsIgnoreCase(role)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Only University and Supervisor can access this resource"));
            }

            Pageable pageable = PageRequest.of(page, size);
            Page<User> pageResult;

            if ("UNIVERSITY".equalsIgnoreCase(role)) {
                pageResult = userService.filterByInstitution(institution, pageable);
            } else {
                Long supervisorId = (Long) request.getAttribute("userId");
                pageResult = userService.filterBySupervisor(supervisorId, pageable);
            }

            List<UserResponseDto> content = pageResult.getContent().stream()
                    .map(this::mapToDTO)
                    .toList();

            return ResponseEntity.ok(Map.of(
                    "content", content,
                    "currentPage", pageResult.getNumber(),
                    "totalPages", pageResult.getTotalPages(),
                    "totalElements", pageResult.getTotalElements()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while intern by university");
        }
    }

    @GetMapping("/filter-by-role")
    public ResponseEntity<?> filterByRole(
            HttpServletRequest request,
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            String token = extractAccessToken(request);
            if (token == null) {
                return ResponseEntity.status(401).body("Missing access_token cookie");
            }

            String role = (String) request.getAttribute("role");

            if (!"HR".equalsIgnoreCase(role) && !"PROJECT_MANAGER".equalsIgnoreCase(role) && !"ADMIN".equalsIgnoreCase(role)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Only HR and PM can access this resource"));
            }

            Pageable pageable = PageRequest.of(page, size);
            Page<User> pageResult = userService.filterUserByRole(query, pageable);

            List<UserResponseDto> content = pageResult.getContent().stream()
                    .map(this::mapToDTO)
                    .toList();

            return ResponseEntity.ok(Map.of(
                    "content", content,
                    "currentPage", pageResult.getNumber(),
                    "totalPages", pageResult.getTotalPages(),
                    "totalElements", pageResult.getTotalElements()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occured while filtering user by role");
        }
    }

    @GetMapping("/filter-interns-by-status")
    public ResponseEntity<?> filterInternByStatus(
            HttpServletRequest request,
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            String token = extractAccessToken(request);
            if (token == null) {
                return ResponseEntity.status(401).body("Missing access_token cookie");
            }

            String role = (String) request.getAttribute("role");

            if (!"HR".equalsIgnoreCase(role) && !"PROJECT_MANAGER".equalsIgnoreCase(role)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Only HR and PM can access this resource"));
            }

            Pageable pageable = PageRequest.of(page, size);
            Page<User> pageResult = userService.filterInternByStatus(query, pageable);

            List<UserResponseDto> content = pageResult.getContent().stream()
                    .map(this::mapToDTO)
                    .toList();

            return ResponseEntity.ok(Map.of(
                    "content", content,
                    "currentPage", pageResult.getNumber(),
                    "totalPages", pageResult.getTotalPages(),
                    "totalElements", pageResult.getTotalElements()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occured while filtering interns by status");
        }
    }

    @GetMapping("/filter-supervisor-by-status")
    public ResponseEntity<?> filterSupervisorByStatus(
            HttpServletRequest request,
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            String token = extractAccessToken(request);
            if (token == null) {
                return ResponseEntity.status(401).body("Missing access_token cookie");
            }

            String role = (String) request.getAttribute("role");

            if (!"UNIVERSITY".equalsIgnoreCase(role)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Only HR and PM can access this resource"));
            }
            Pageable pageable = PageRequest.of(page, size);
            Page<User> pageResult = userService.filterSupervisorByStatus(query, pageable);

            List<UserResponseDto> content = pageResult.getContent().stream()
                    .map(this::mapToDTO)
                    .toList();

            return ResponseEntity.ok(Map.of(
                    "content", content,
                    "currentPage", pageResult.getNumber(),
                    "totalPages", pageResult.getTotalPages(),
                    "totalElements", pageResult.getTotalElements()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occured while filtering supervisor by status");
        }
    }

    @GetMapping("/filter-supervisor-by-field-of-study")
    public ResponseEntity<?> filterSupervisorByFieldOfStudy(
            HttpServletRequest request,
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            String token = extractAccessToken(request);
            if (token == null) {
                return ResponseEntity.status(401).body("Missing access_token cookie");
            }

            String role = (String) request.getAttribute("role");

            if (!"UNIVERSITY".equalsIgnoreCase(role)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Only HR and PM can access this resource"));
            }
            Pageable pageable = PageRequest.of(page, size);
            Page<User> pageResult = userService.filterSupervisorByFieldOfStudy(query, pageable);

            List<UserResponseDto> content = pageResult.getContent().stream()
                    .map(this::mapToDTO)
                    .toList();

            return ResponseEntity.ok(Map.of(
                    "content", content,
                    "currentPage", pageResult.getNumber(),
                    "totalPages", pageResult.getTotalPages(),
                    "totalElements", pageResult.getTotalElements()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("AN error occured while filtering supervisor by field of study");
        }
    }

    @GetMapping("/filter-supervisor-by-institution")
    public ResponseEntity<?> getSupervisorsByInstitution(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            String token = extractAccessToken(request);
            if (token == null) {
                return ResponseEntity.status(401).body("Missing access_token cookie");
            }

            String role = (String) request.getAttribute("role");
            String institution = (String) request.getAttribute("institution");

            if (!"UNIVERSITY".equalsIgnoreCase(role)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Only HR and PM can access this resource"));
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
                    "totalElements", pageResult.getTotalElements()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occured while getting supervisor by institution");
        }
    }

    @GetMapping("/filter-all-users-by-status")
    public ResponseEntity<?> filterAllUserByStatus(
            HttpServletRequest request,
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            String token = extractAccessToken(request);
            if (token == null) {
                return ResponseEntity.status(401).body("Missing access_token cookie");
            }

            String role = (String) request.getAttribute("role");

            if (!"ADMIN".equalsIgnoreCase(role)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Only Admin can access this resource"));
            }

            Pageable pageable = PageRequest.of(page, size);
            Page<User> pageResult = userService.filterAllUsersByStatus(query, pageable);

            List<UserResponseDto> content = pageResult.getContent().stream()
                    .map(this::mapToDTO)
                    .toList();

            return ResponseEntity.ok(Map.of(
                    "content", content,
                    "currentPage", pageResult.getNumber(),
                    "totalPages", pageResult.getTotalPages(),
                    "totalElements", pageResult.getTotalElements()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occured while filtering all users by status");
        }
    }

    @PostMapping("/role/create")
    public ResponseEntity<?> createRole(HttpServletRequest request, @RequestBody RolesDTO dto) {
        try {
            String token = extractAccessToken(request);
            if (token == null) {
                return ResponseEntity.status(401).body("Missing access_token cookie");
            }

            String role = (String) request.getAttribute("role");

            if (!"ADMIN".equalsIgnoreCase(role)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Only Admin can access this resource"));
            }

            Role newRole = userService.createRole(dto);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "New Role created successfully");
            response.put("role", newRole);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occured while creating role");
        }

    }

    @GetMapping("/filter-intern-by-supervisor")
    public ResponseEntity<?> filterInternsBySupervisor(
            HttpServletRequest request,
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            String token = extractAccessToken(request);
            if (token == null) {
                return ResponseEntity.status(401).body("Missing access_token cookie");
            }

            String role = (String) request.getAttribute("role");

            if (!"UNIVERSITY".equalsIgnoreCase(role)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Only UNIVERSITY can access this resource"));
            }
            Pageable pageable = PageRequest.of(page, size);
            Page<User> pageResult = userService.filterInternBySupervisor(query, pageable);

            List<UserResponseDto> content = pageResult.getContent().stream()
                    .map(this::mapToDTO)
                    .toList();

            return ResponseEntity.ok(Map.of(
                    "content", content,
                    "currentPage", pageResult.getNumber(),
                    "totalPages", pageResult.getTotalPages(),
                    "totalElements", pageResult.getTotalElements()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occured while filtering intern by their assigned supervisors");
        }
    }

    private void logActivity(String jwtToken, Long userId, String action, String description) {
        try {
            activityGrpcClient.createActivity(jwtToken, userId, action, description);
        } catch (Exception e) {
            // Log the failure, but do NOT block business logic
            System.err.println("Failed to log activity: " + e.getMessage());
        }
    }

    private Long countUserByStatus(String role, UserStatus status) {
        try {
            return userService.countByRoleAndUserStatus(role, status);
        } catch (Exception e) {
            return 0L;
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
        if (userId == 0) {
            try {
                TotalReportResponse stats = reportGrpcClient.getReportStatsForHR(jwtToken);
                status.put("totalPending", stats.getTotalPendingReports());
                status.put("totalgiven", stats.getTotalResolvedReports());
            } catch (Exception e) {
                status.put("totalPending", 0);
                status.put("totalgiven", 0.0);
            }
        } else {
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
        if (userId == 0) {
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
        } else {
            try {
                ProjectStatsResponse stats = projectManagerGrpcClient.getProjectStatsForPM(jwtToken, userId);
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
            GetRecentActivitiesResponse grpcResponse = activityGrpcClient.getRecentActivities(jwtToken, userId,
                    pageable.getPageNumber(), pageable.getPageSize());

            return grpcResponse.getActivitiesList().stream()
                    .map(a -> new ActivityDTO(
                            a.getId(),
                            a.getUserId(),
                            a.getTitle(),
                            a.getDescription(),
                            LocalDateTime.parse(a.getCreatedAt())))
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
                AllMilestones activeMilestones = projectManagerGrpcClient.getActiveMilestones(jwtToken,
                        internDTO.getProjectId());
                if (activeMilestones != null) {
                    milestoneDTOs = activeMilestones.getMilestonesList().stream()
                            .map(m -> new MilestoneResponse(
                                    m.getMilestoneId(),
                                    m.getMilestoneTitle(),
                                    m.getMilestoneDescription(),
                                    m.getMilestoneStatus(),
                                    m.hasMilestoneDueDate() ? LocalDateTime.ofInstant(
                                            Instant.ofEpochSecond(m.getMilestoneDueDate().getSeconds(),
                                                    m.getMilestoneDueDate().getNanos()),
                                            ZoneId.systemDefault()) : null,
                                    m.hasMilestoneCreatedAt() ? LocalDateTime.ofInstant(
                                            Instant.ofEpochSecond(m.getMilestoneCreatedAt().getSeconds(),
                                                    m.getMilestoneCreatedAt().getNanos()),
                                            ZoneId.systemDefault()) : null))
                            .toList();
                }
            }
        } catch (Exception e) {
            // return empty list if any error
        }
        return milestoneDTOs;
    }

    private ResponseEntity<?> errorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    private String extractAccessToken(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("access_token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    private UserResponseDto mapToDTO(User user) {
        return new UserResponseDto(user);
    }

}
