package com.example.project_service.controller;

import com.example.project_service.dto.*;
import com.example.project_service.models.*;
import com.example.project_service.service.ProjectServiceInterface;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
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
    @PostMapping
    public ResponseEntity<?> createProject(@RequestBody ProjectRequest request,
                                           HttpServletRequest httpRequest) {
        try {
            String role = (String) httpRequest.getAttribute("role");
            Long userId = (Long) httpRequest.getAttribute("userId");

            if (!"PROJECT_MANAGER".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized: Only PM can create projects");
            }

            ProjectResponse created = projectService.createProject(userId, request);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getProjectStats(HttpServletRequest httpRequest) {
        try {
            String role = (String) httpRequest.getAttribute("role");
            Long user_id = (Long) httpRequest.getAttribute("userId");
            if (!"PROJECT_MANAGER".equalsIgnoreCase(role) && !"HR".equalsIgnoreCase(role)) {
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

    @GetMapping("/search")
    public ResponseEntity<?> searchProjects(@RequestParam String keyword, Pageable pageable,
                                            HttpServletRequest httpRequest) {
        try {
            String role = (String) httpRequest.getAttribute("role");
            Long userId = (Long) httpRequest.getAttribute("userId");
            if (!"PROJECT_MANAGER".equalsIgnoreCase(role) && !"HR".equalsIgnoreCase(role)) {
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

    @GetMapping
    public ResponseEntity<?> getProjects(Pageable pageable, HttpServletRequest httpRequest) {
        try {
            String role = (String) httpRequest.getAttribute("role");
            Long userId = (Long) httpRequest.getAttribute("userId");

            if ("HR".equalsIgnoreCase(role)) {
                return ResponseEntity.ok(projectService.getDetailedProjectsForHr(pageable));
            } else if ("PROJECT_MANAGER".equalsIgnoreCase(role)) {
                return ResponseEntity.ok(projectService.getDetailedProjectsForPm(userId, pageable));
            } else {
                return errorResponse("Unauthorized: Only PM and HR can view projects");
            }
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    @PatchMapping("/{projectId}/status")
    public ResponseEntity<?> updateProjectStatus(@PathVariable Long projectId,
                                                 @RequestParam ProjectStatus newStatus,
                                                 HttpServletRequest httpRequest) {
        try {
            String role = (String) httpRequest.getAttribute("role");
            if (!"PROJECT_MANAGER".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized: Only PM can change project status");
            }
            ProjectResponse updated = projectService.updateProjectStatus(projectId, newStatus);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    // -------------------- TEAMS --------------------

    @PostMapping("/teams")
    public ResponseEntity<?> createTeam(@RequestBody TeamRequest request, HttpServletRequest httpRequest) {
        try {
            String role = (String) httpRequest.getAttribute("role");
            if (!"PROJECT_MANAGER".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized: Only PM can create teams");
            }
            TeamDetailsResponse created = projectService.createTeam(request);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    @GetMapping("/teams")
    public ResponseEntity<?> getTeams(Pageable pageable, HttpServletRequest httpRequest) {
        try {
            String role = (String) httpRequest.getAttribute("role");
            Long userId = (Long) httpRequest.getAttribute("userId");

            if ("HR".equalsIgnoreCase(role)) {
                return ResponseEntity.ok(projectService.getDetailedTeamsForHr(pageable));
            } else if ("PROJECT_MANAGER".equalsIgnoreCase(role)) {
                return ResponseEntity.ok(projectService.getDetailedTeamsForPm(userId, pageable));
            } else {
                return errorResponse("Unauthorized: Only PM and HR can view teams");
            }
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    // -------------------- TEAM MEMBERS --------------------

    @PostMapping("/teams/members")
    public ResponseEntity<?> addTeamMember(@RequestBody TeamMemberRequest request,
                                           HttpServletRequest httpRequest) {
        try {
            String role = (String) httpRequest.getAttribute("role");
            Long userId = (Long) httpRequest.getAttribute("userId");
            if (!"PROJECT_MANAGER".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized: Only PM can add team members");
            }

            List<TeamMemberResponse> added = projectService.addTeamMember(userId,request);
            return ResponseEntity.ok(added);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

  
    @DeleteMapping("/teams/members/{memberId}")
    public ResponseEntity<?> removeTeamMember(@PathVariable Long memberId,
                                              HttpServletRequest httpRequest) {
        try {
            String role = (String) httpRequest.getAttribute("role");
            Long userId = (Long) httpRequest.getAttribute("userId");

            if (!"PROJECT_MANAGER".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized: Only PM can remove team members");
            }
            projectService.removeTeamMember(userId,memberId);
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
            Long userId = (Long) httpRequest.getAttribute("userId");
            if (!"PROJECT_MANAGER".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized: Only PM can assign projects");
            }
            TeamDetailsResponse updated = projectService.assignProjectToTeam(userId,teamId, projectId);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    @PatchMapping("/teams/{teamId}/remove-project")
    public ResponseEntity<?> removeProject(@PathVariable Long teamId, HttpServletRequest httpRequest) {
        try {
            String role = (String) httpRequest.getAttribute("role");
            Long userId = (Long) httpRequest.getAttribute("userId");
            if (!"PROJECT_MANAGER".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized: Only PM can remove projects");
            }
            TeamDetailsResponse updated = projectService.removeAssignedProjectFromTeam(userId,teamId);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    // -------------------- MILESTONES --------------------
    @PostMapping("/milestones")
    public ResponseEntity<?> addMilestone(@RequestBody MilestoneRequest request, HttpServletRequest httpRequest) {
        try {
            String role = (String) httpRequest.getAttribute("role");
            Long userId = (Long) httpRequest.getAttribute("userId");
            if (!"PROJECT_MANAGER".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized: Only PM can add milestones");
            }

            MilestoneResponse added = projectService.addMilestone(userId,request);
            return ResponseEntity.ok(added);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }


    @PatchMapping("/milestones/{milestoneId}/status")
    public ResponseEntity<?> updateMilestoneStatus(@PathVariable Long milestoneId,
                                                   @RequestParam MilestoneStatus newStatus,
                                                   HttpServletRequest httpRequest) {
        try {
            String role = (String) httpRequest.getAttribute("role");
            Long userId = (Long) httpRequest.getAttribute("userId");
            if (!"PROJECT_MANAGER".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized: Only PM can update milestone status");
            }
            MilestoneResponse updated = projectService.updateMilestoneStatus(userId,milestoneId, newStatus);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    @DeleteMapping("/milestones/{milestoneId}")
    public ResponseEntity<?> deleteMilestone(@PathVariable Long milestoneId, HttpServletRequest httpRequest) {
        try {
            String role = (String) httpRequest.getAttribute("role");
            Long userId = (Long) httpRequest.getAttribute("userId");
            if (!"PROJECT_MANAGER".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized: Only PM can delete milestones");
            }
            projectService.deleteMilestone(userId,milestoneId);
            return successResponse("Milestone deleted");
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }

    
    @GetMapping("/{projectId}/milestones")
    public ResponseEntity<?> getMilestonesByProjectId(@PathVariable Long projectId,
                                                      HttpServletRequest httpRequest) {
        try {
            String role = (String) httpRequest.getAttribute("role");
            Long userId = (Long) httpRequest.getAttribute("userId");

            if (!"PROJECT_MANAGER".equalsIgnoreCase(role) && !"HR".equalsIgnoreCase(role)) {
                return errorResponse("Unauthorized: Only PM and HR can view milestones");
            }
            List<MilestoneResponse> milestones = projectService.getMilestonesByProjectId(userId,projectId);
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
