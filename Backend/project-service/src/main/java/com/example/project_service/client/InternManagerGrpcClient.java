package com.example.project_service.client;

import com.example.userservice.gRPC.CreateRequest;
import com.example.userservice.gRPC.CreateResponse;
import com.example.userservice.gRPC.InternManagerRequest;
import com.example.userservice.gRPC.InternManagerResponse;
import com.example.userservice.gRPC.InternManagerServiceGrpc;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;

import java.util.List;
import java.util.concurrent.TimeUnit;

public class InternManagerGrpcClient {

    private final ManagedChannel channel;
    private final InternManagerServiceGrpc.InternManagerServiceBlockingStub blockingStub;

    public InternManagerGrpcClient(String host, int port) {
        this.channel = ManagedChannelBuilder.forAddress(host, port)
                .usePlaintext() // ⚠️ replace with TLS in production
                .build();
        this.blockingStub = InternManagerServiceGrpc.newBlockingStub(channel);
    }

    /**
     * Fetch InternManager info for a given userId
     */
    public InternManagerResponse getInternManagerInfo(String jwtToken, Long userId) {
        JwtClientInterceptor authInterceptor = new JwtClientInterceptor(jwtToken);
        InternManagerServiceGrpc.InternManagerServiceBlockingStub stubWithAuth =
                blockingStub.withInterceptors(authInterceptor);

        InternManagerRequest request = InternManagerRequest.newBuilder()
                .setUserId(userId)
                .build();

        return stubWithAuth.getInternManagerInfo(request);
    }

    /**
     * Create or update InternManager records in batch
     */
    public CreateResponse createInternManagers(String jwtToken,
                                               List<Long> userIds,
                                               Long projectId,
                                               Long managerId,
                                               Long teamId) {
        JwtClientInterceptor authInterceptor = new JwtClientInterceptor(jwtToken);
        InternManagerServiceGrpc.InternManagerServiceBlockingStub stubWithAuth =
                blockingStub.withInterceptors(authInterceptor);

        CreateRequest request = CreateRequest.newBuilder()
                .addAllUserIds(userIds)
                .setProjectId(projectId != null ? projectId : 0)
                .setManagerId(managerId != null ? managerId : 0)
                .setTeamId(teamId != null ? teamId : 0)
                .build();

        return stubWithAuth.createInternManager(request);
    }

    /**
     * Shutdown gRPC channel
     */
    public void shutdown() throws InterruptedException {
        channel.shutdown().awaitTermination(5, TimeUnit.SECONDS);
    }
}
