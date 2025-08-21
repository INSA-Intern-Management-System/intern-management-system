package com.example.userservice.client;

import java.util.List;
import java.util.concurrent.TimeUnit;

import com.example.project_service.gRPC.AllMilestones;
import com.example.project_service.gRPC.AllProjectRequests;
import com.example.project_service.gRPC.AllProjectResponses;
import com.example.project_service.gRPC.MilestoneStatsResponse;
import com.example.project_service.gRPC.ProjectIds;
import com.example.project_service.gRPC.ProjectManagerServiceGrpc;
import com.example.project_service.gRPC.ProjectRequest;
import com.example.project_service.gRPC.ProjectResponse;
import com.example.project_service.gRPC.ProjectStatsResponse;
import com.example.project_service.gRPC.UserProjectRequest;
import com.example.report_service.gRPC.ReportServiceGrpc;
import com.example.report_service.gRPC.ReportStatsRequest;
import com.example.report_service.gRPC.TotalReportResponse;
import com.google.protobuf.Empty;

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

    public ProjectStatsResponse getProjectStatsForHR(String jwtToken) {
         JwtClientInterceptor authInterceptor = new JwtClientInterceptor(jwtToken);
        ProjectManagerServiceGrpc.ProjectManagerServiceBlockingStub stubWithAuth = blockingStub.withInterceptors(authInterceptor);

        return stubWithAuth.getProjectStatsForHR(Empty.newBuilder().build());
    }

    public ProjectStatsResponse getProjectStatsForPM(String jwtToken, Long userId) {
        JwtClientInterceptor authInterceptor = new JwtClientInterceptor(jwtToken);
        ProjectManagerServiceGrpc.ProjectManagerServiceBlockingStub stubWithAuth = blockingStub.withInterceptors(authInterceptor);

        UserProjectRequest request = UserProjectRequest.newBuilder()
                .setUserId(userId)
                .build();

        return stubWithAuth.getProjectStatsForPM(request);
    }

    public MilestoneStatsResponse getMilestoneStats(String jwtToken, List<Long> projectIds) {
        // Attach JWT token for authentication
        JwtClientInterceptor authInterceptor = new JwtClientInterceptor(jwtToken);
        ProjectManagerServiceGrpc.ProjectManagerServiceBlockingStub stubWithAuth = blockingStub.withInterceptors(authInterceptor);

        // Build request
        ProjectIds request = ProjectIds.newBuilder()
                .addAllProjectIds(projectIds)
                .build();

        // Call gRPC method and return response
        return stubWithAuth.getMilestoneStats(request);

}





    public void shutdown() throws InterruptedException {
        channel.shutdown().awaitTermination(5, TimeUnit.SECONDS);
    }
}



