package com.example.project_service.controller;

import com.example.project_service.dto.*;
import com.example.project_service.models.*;
import com.example.project_service.service.ProjectServiceInterface;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
//import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectServiceInterface projectService;

    @Autowired
    public ProjectController(ProjectServiceInterface projectService) {
        this.projectService = projectService;
    }

    // -------------------- PROJECTS --------------------

    // Create a project - only PM
    @PostMapping
    public ResponseEntity<?> createProject(@RequestBody ProjectRequest request,
                                           HttpServletRequest httpRequest) {
        try {
            String role = (String) httpRequest.getAttribute("role");
            Long userId = (Long) httpRequest.getAttribute("userId");

            if (!"Project_Manager".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized: Only PM can create projects");
            }

            ProjectResponse created = projectService.createProject(userId, request);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    // Get project stats - PM & HR
    @GetMapping("/stats")
    public ResponseEntity<?> getProjectStats(HttpServletRequest httpRequest) {
        try {
            String role = (String) httpRequest.getAttribute("role");
            Long user_id = (Long) httpRequest.getAttribute("userId");
            if (!"Project_Manager".equalsIgnoreCase(role) && !"HR".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized: Only PM and HR can view stats");
            }
            if (("HR".equalsIgnoreCase(role))) {
                return ResponseEntity.ok(projectService.getProjectStatsHR());
            }else{
                return ResponseEntity.ok(projectService.getProjectStatsPM(user_id));
            }
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    // Search projects - PM & HR
    @GetMapping("/search")
    public ResponseEntity<?> searchProjects(@RequestParam String keyword, Pageable pageable,
                                            HttpServletRequest httpRequest) {
        try {
            String role = (String) httpRequest.getAttribute("role");
            Long userId = (Long) httpRequest.getAttribute("userId");
            if (!"Project_Manager".equalsIgnoreCase(role) && !"HR".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized: Only PM and HR can search projects");
            }
            if (("HR".equalsIgnoreCase(role))) {
                return ResponseEntity.ok(projectService.searchProjectsHR(keyword, pageable));
            }else{
                return ResponseEntity.ok(projectService.searchProjectsPM(userId,keyword, pageable));
            }
    
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    // Get project details - different for HR & PM
    @GetMapping
    public ResponseEntity<?> getProjects(Pageable pageable, HttpServletRequest httpRequest) {
        try {
            String role = (String) httpRequest.getAttribute("role");
            Long userId = (Long) httpRequest.getAttribute("userId");

            if ("HR".equalsIgnoreCase(role)) {
                return ResponseEntity.ok(projectService.getDetailedProjectsForHr(pageable));
            } else if ("Project_Manager".equalsIgnoreCase(role)) {
                return ResponseEntity.ok(projectService.getDetailedProjectsForPm(userId, pageable));
            } else {
                return errorResponse("Unauthorized: Only PM and HR can view projects");
            }
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    // Change project status - only PM
    @PatchMapping("/{projectId}/status")
    public ResponseEntity<?> updateProjectStatus(@PathVariable Long projectId,
                                                 @RequestParam ProjectStatus newStatus,
                                                 HttpServletRequest httpRequest) {
        try {
            String role = (String) httpRequest.getAttribute("role");
            if (!"Project_Manager".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized: Only PM can change project status");
            }
            ProjectResponse updated = projectService.updateProjectStatus(projectId, newStatus);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    // -------------------- TEAMS --------------------

    // Create a team - only PM
    @PostMapping("/teams")
    public ResponseEntity<?> createTeam(@RequestBody TeamRequest request, HttpServletRequest httpRequest) {
        try {
            String role = (String) httpRequest.getAttribute("role");
            if (!"Project_Manager".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized: Only PM can create teams");
            }
            TeamDetailsResponse created = projectService.createTeam(request);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    // Get teams - different for HR & PM
    @GetMapping("/teams")
    public ResponseEntity<?> getTeams(Pageable pageable, HttpServletRequest httpRequest) {
        try {
            String role = (String) httpRequest.getAttribute("role");
            Long userId = (Long) httpRequest.getAttribute("userId");

            if ("HR".equalsIgnoreCase(role)) {
                return ResponseEntity.ok(projectService.getDetailedTeamsForHr(pageable));
            } else if ("Project_Manager".equalsIgnoreCase(role)) {
                return ResponseEntity.ok(projectService.getDetailedTeamsForPm(userId, pageable));
            } else {
                return errorResponse("Unauthorized: Only PM and HR can view teams");
            }
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    // -------------------- TEAM MEMBERS --------------------

    // Add member - only PM
    @PostMapping("/teams/members")
    public ResponseEntity<?> addTeamMember(@RequestBody TeamMemberRequest request,
                                           HttpServletRequest httpRequest) {
        try {
            String role = (String) httpRequest.getAttribute("role");
            if (!"Project_Manager".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized: Only PM can add team members");
            }
            List<TeamMemberResponse> added = projectService.addTeamMember(request);
            return ResponseEntity.ok(added);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    // Remove member - only PM
    @DeleteMapping("/teams/members/{memberId}")
    public ResponseEntity<?> removeTeamMember(@PathVariable Long memberId,
                                              HttpServletRequest httpRequest) {
        try {
            String role = (String) httpRequest.getAttribute("role");
            if (!"Project_Manager".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized: Only PM can remove team members");
            }
            projectService.removeTeamMember(memberId);
            return successResponse("Team member removed");
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    // -------------------- ASSIGN / REMOVE PROJECT --------------------

    @PatchMapping("/teams/{teamId}/assign-project/{projectId}")
    public ResponseEntity<?> assignProject(@PathVariable Long teamId, @PathVariable Long projectId,
                                           HttpServletRequest httpRequest) {
        try {
            String role = (String) httpRequest.getAttribute("role");
            if (!"Project_Manager".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized: Only PM can assign projects");
            }
            TeamDetailsResponse updated = projectService.assignProjectToTeam(teamId, projectId);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    @PatchMapping("/teams/{teamId}/remove-project")
    public ResponseEntity<?> removeProject(@PathVariable Long teamId, HttpServletRequest httpRequest) {
        try {
            String role = (String) httpRequest.getAttribute("role");
            if (!"Project_Manager".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized: Only PM can remove projects");
            }
            TeamDetailsResponse updated = projectService.removeAssignedProjectFromTeam(teamId);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    // -------------------- MILESTONES --------------------

    // Add milestone - only PM
    @PostMapping("/milestones")
    public ResponseEntity<?> addMilestone(@RequestBody MilestoneRequest request, HttpServletRequest httpRequest) {
        try {
            String role = (String) httpRequest.getAttribute("role");
            if (!"Project_Manager".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized: Only PM can add milestones");
            }
            MilestoneResponse added = projectService.addMilestone(request);
            return ResponseEntity.ok(added);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    // Update milestone status - only PM
    @PatchMapping("/milestones/{milestoneId}/status")
    public ResponseEntity<?> updateMilestoneStatus(@PathVariable Long milestoneId,
                                                   @RequestParam MilestoneStatus newStatus,
                                                   HttpServletRequest httpRequest) {
        try {
            String role = (String) httpRequest.getAttribute("role");
            if (!"Project_Manager".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized: Only PM can update milestone status");
            }
            MilestoneResponse updated = projectService.updateMilestoneStatus(milestoneId, newStatus);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    // Delete milestone - only PM
    @DeleteMapping("/milestones/{milestoneId}")
    public ResponseEntity<?> deleteMilestone(@PathVariable Long milestoneId, HttpServletRequest httpRequest) {
        try {
            String role = (String) httpRequest.getAttribute("role");
            if (!"Project_Manager".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized: Only PM can delete milestones");
            }
            projectService.deleteMilestone(milestoneId);
            return successResponse("Milestone deleted");
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    // Get milestones by project ID - PM & HR
    @GetMapping("/{projectId}/milestones")
    public ResponseEntity<?> getMilestonesByProjectId(@PathVariable Long projectId,
                                                      HttpServletRequest httpRequest) {
        try {
            String role = (String) httpRequest.getAttribute("role");
            if (!"Project_Manager".equalsIgnoreCase(role) && !"HR".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized: Only PM and HR can view milestones");
            }
            List<MilestoneResponse> milestones = projectService.getMilestonesByProjectId(projectId);
            return ResponseEntity.ok(milestones);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    // -------------------- HELPERS --------------------
    private ResponseEntity<Map<String, String>> errorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return ResponseEntity.status(400).body(error);
    }

    private ResponseEntity<Map<String, String>> successResponse(String message) {
        Map<String, String> res = new HashMap<>();
        res.put("message", message);
        return ResponseEntity.ok(res);
    }
}
