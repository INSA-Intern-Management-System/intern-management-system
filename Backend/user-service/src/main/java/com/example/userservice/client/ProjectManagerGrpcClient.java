package com.example.userservice.client;

import java.util.List;
import java.util.concurrent.TimeUnit;

import com.example.project_service.gRPC.AllMilestones;
import com.example.project_service.gRPC.AllProjectRequests;
import com.example.project_service.gRPC.AllProjectResponses;
import com.example.project_service.gRPC.ProjectManagerServiceGrpc;
import com.example.project_service.gRPC.ProjectRequest;
import com.example.project_service.gRPC.ProjectResponse;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;

public class ProjectManagerGrpcClient {
    private final ManagedChannel channel;
    private final ProjectManagerServiceGrpc.ProjectManagerServiceBlockingStub blockingStub;

    public ProjectManagerGrpcClient(String host, int port) {
        this.channel = ManagedChannelBuilder.forAddress(host, port)
                .usePlaintext()
                .build();
        this.blockingStub = ProjectManagerServiceGrpc.newBlockingStub(channel);
    }

    public ProjectResponse getProjectInfo(String jwtToken, Long projectID) {
        // Create client interceptor with JWT token
        JwtClientInterceptor authInterceptor = new JwtClientInterceptor(jwtToken);
        ProjectManagerServiceGrpc.ProjectManagerServiceBlockingStub stubWithAuth =
                blockingStub.withInterceptors(authInterceptor);

        ProjectRequest request = ProjectRequest.newBuilder()
                .setProjectId(projectID)
                .build();

        return stubWithAuth.getProjectInfo(request);
    }

    public AllProjectResponses getProjects(String jwtToken,List<Long> projectIds) {
        // Create client interceptor with JWT token
        JwtClientInterceptor authInterceptor = new JwtClientInterceptor(jwtToken);
        ProjectManagerServiceGrpc.ProjectManagerServiceBlockingStub stubWithAuth =
                blockingStub.withInterceptors(authInterceptor);

        AllProjectRequests request = AllProjectRequests.newBuilder()
                .addAllProjectIds(projectIds)
                .build();

        return stubWithAuth.getProjects(request);
    }
    public AllMilestones getActiveMilestones(String jwtToken, Long projectID) {
        // Create client interceptor with JWT token
        JwtClientInterceptor authInterceptor = new JwtClientInterceptor(jwtToken);
        ProjectManagerServiceGrpc.ProjectManagerServiceBlockingStub stubWithAuth =
                blockingStub.withInterceptors(authInterceptor);
        ProjectRequest request = ProjectRequest.newBuilder()
                .setProjectId(projectID)
                .build();

        return stubWithAuth.getActiveMilestones(request);   
    }




    public void shutdown() throws InterruptedException {
        channel.shutdown().awaitTermination(5, TimeUnit.SECONDS);
    }
}



