package com.example.project_service.gRPC;

import java.util.HashMap;
import java.util.List;
import java.util.Optional;

import com.example.project_service.dto.ProjectMilestoneStatsDTO;
import com.example.project_service.models.Milestone;
import com.example.project_service.models.MilestoneStatus;
import com.example.project_service.models.Project;
import com.example.project_service.repository.MilestoneReposInterface;
import com.example.project_service.repository.ProjectReposInterface;
import com.example.project_service.service.ProjectServiceImp;
import com.google.protobuf.Timestamp;

import io.grpc.stub.StreamObserver;
import java.io.InputStream;
import java.time.ZoneOffset;

public class ProjectManagerGrpcService extends ProjectManagerServiceGrpc.ProjectManagerServiceImplBase {

    private final ProjectReposInterface repository;
    private final MilestoneReposInterface mileRepos;
    private final ProjectServiceImp projectService;
    public ProjectManagerGrpcService(ProjectReposInterface repository,MilestoneReposInterface mileRepos,ProjectServiceImp projectService) {
        this.repository = repository;
        this.mileRepos=mileRepos;
        this.projectService=projectService;
        System.out.println("✅ ProjectManagerGrpcService created!");
    }

    @Override
    public void getProjectInfo(ProjectRequest request, StreamObserver<ProjectResponse> responseObserver) {
        Optional<Project> project = repository.getProjectById(request.getProjectId());
        if (project == null) {
            responseObserver.onError(new RuntimeException("Project info not found"));
            return;
        }

        ProjectResponse response = ProjectResponse.newBuilder()
                .setProjectId(project.get().getId())
                .setProjectName(project.get().getName())
                .setProjectDescription(project.get().getDescription())
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
    @Override
    public void getProjects(AllProjectRequests request, StreamObserver<AllProjectResponses> responseObserver) {
        AllProjectResponses.Builder responseBuilder = AllProjectResponses.newBuilder();
        for (Project project : repository.findByProjectIds(request.getProjectIdsList())) {
            ProjectResponse response = ProjectResponse.newBuilder()
                    .setProjectId(project.getId())
                    .setProjectName(project.getName())
                    .setProjectDescription(project.getDescription())
                    .build();
            responseBuilder.addProjects(response);
        }

        responseObserver.onNext(responseBuilder.build());
        responseObserver.onCompleted();
    }

    @Override
    public void getActiveMilestones(ProjectRequest request, StreamObserver<AllMilestones> responseObserver) {
        AllMilestones.Builder responseBuilder = AllMilestones.newBuilder();

        List<Milestone> milestones = mileRepos.getMilestonesByProjectIdExceptCompleted(request.getProjectId());

        for (Milestone mile : milestones) {
            // Map Milestone status to proto enum
            MilestoneStatusProto mileStatus;
            switch (mile.getStatus()) {
                case IN_PROGRESS -> mileStatus = MilestoneStatusProto.IN_PROGRESS;
                case COMPLETED -> mileStatus = MilestoneStatusProto.COMPLETED;
                case ON_HOLD -> mileStatus = MilestoneStatusProto.ON_HOLD;
                default -> mileStatus = MilestoneStatusProto.MILESTONE_STATUS_UNSPECIFIED;
            }

            // Convert java.util.Date to protobuf Timestamp
            Timestamp createdAtTimestamp = mile.getCreatedAt() != null
                    ? Timestamp.newBuilder()
                        .setSeconds(mile.getCreatedAt().getTime() / 1000)
                        .setNanos((int)((mile.getCreatedAt().getTime() % 1000) * 1_000_000))
                        .build()
                    : null;

            Timestamp dueDateTimestamp = mile.getDueDate() != null
                    ? Timestamp.newBuilder()
                        .setSeconds(mile.getDueDate().getTime() / 1000)
                        .setNanos((int)((mile.getDueDate().getTime() % 1000) * 1_000_000))
                        .build()
                    : null;

            MilestoneResponseProto response = MilestoneResponseProto.newBuilder()
                    .setMilestoneId(mile.getId())
                    .setMilestoneTitle(mile.getTitle())
                    .setMilestoneDescription(mile.getDescription())
                    .setMilestoneStatus(mileStatus)
                    .setMilestoneCreatedAt(createdAtTimestamp!= null ? createdAtTimestamp : Timestamp.getDefaultInstance())
                    .setMilestoneDueDate(dueDateTimestamp != null ? dueDateTimestamp : Timestamp.getDefaultInstance())
                    .build();

            responseBuilder.addMilestones(response);
        }

        responseObserver.onNext(responseBuilder.build());
        responseObserver.onCompleted();
    }


    @Override
    public void getProjectStatsForPM(UserProjectRequest request, StreamObserver<ProjectStatsResponse> responseObserver) {
        HashMap<String, Long> projectStats = projectService.getProjectStatsPM(request.getUserId());
        if (projectStats == null) {
            responseObserver.onError(new RuntimeException("Project stats info not found"));
            return;
        }

        ProjectStatsResponse response = ProjectStatsResponse.newBuilder()
                .setActive(projectStats.get("active"))
                .setCompleted(projectStats.get("completed"))
                .setPlanning(projectStats.get("planning"))
                .setTotal(projectStats.get("total"))
                .build();
        responseObserver.onNext(response);
        responseObserver.onCompleted();


    }
    @Override
    public void getProjectStatsForHR(com.google.protobuf.Empty request, StreamObserver<ProjectStatsResponse> responseObserver) {
        
        HashMap<String, Long> projectStats = projectService.getProjectStatsHR();
        if (projectStats == null) {
            responseObserver.onError(new RuntimeException("Project stats info not found"));
            return;
        }

        ProjectStatsResponse response = ProjectStatsResponse.newBuilder()
                .setActive(projectStats.get("active"))
                .setCompleted(projectStats.get("completed"))
                .setPlanning(projectStats.get("planning"))
                .setTotal(projectStats.get("total"))
                .build();
        responseObserver.onNext(response);
        responseObserver.onCompleted();


    }

    @Override
    public void getMilestoneStats(ProjectIds request, StreamObserver<MilestoneStatsResponse> responseObserver) {
        try {
            // Extract project IDs from request
            List<Long> projectIds = request.getProjectIdsList();

            if (projectIds == null || projectIds.isEmpty()) {
                responseObserver.onError(new RuntimeException("No project IDs provided"));
                return;
            }

            // Call your service to fetch stats
            List<ProjectMilestoneStatsDTO> statsList = projectService.findMilestoneStatsByProjectsAndStatus(projectIds,MilestoneStatus.COMPLETED);

            if (statsList == null || statsList.isEmpty()) {
                responseObserver.onError(new RuntimeException("No stats found for given projects"));
                return;
            }

            // Build gRPC response
            MilestoneStatsResponse.Builder responseBuilder = MilestoneStatsResponse.newBuilder();

            for (ProjectMilestoneStatsDTO dto : statsList) {
                StatsResponse statsResponse = StatsResponse.newBuilder()
                        .setProjectId(dto.getProjectId())   // Long → int64
                        .setTotal(dto.getTotalMilestones())           // Long → int64
                        .setCompleted(dto.getStatusCount())   // Long → int64
                        .build();

                responseBuilder.addStats(statsResponse);
            }

            responseObserver.onNext(responseBuilder.build());
            responseObserver.onCompleted();

        } catch (Exception e) {
            responseObserver.onError(e);
        }
}

    

}


