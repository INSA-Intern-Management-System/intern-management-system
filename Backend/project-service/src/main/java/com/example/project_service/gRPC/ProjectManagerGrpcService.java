package com.example.project_service.gRPC;

import java.util.Optional;

import com.example.project_service.models.Project;
import com.example.project_service.repository.ProjectReposInterface;

import io.grpc.stub.StreamObserver;

public class ProjectManagerGrpcService extends ProjectManagerServiceGrpc.ProjectManagerServiceImplBase {

    private final ProjectReposInterface repository;

    public ProjectManagerGrpcService(ProjectReposInterface repository) {
        this.repository = repository;
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

}


