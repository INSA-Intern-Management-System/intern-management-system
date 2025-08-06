package com.example.project_service.client;
import com.example.activity_service.gRPC.ActivityResponse;
import com.example.activity_service.gRPC.ActivityServiceGrpc;
import com.example.activity_service.gRPC.CreateActivityRequest;
import com.example.activity_service.gRPC.GetRecentActivitiesRequest;
import com.example.activity_service.gRPC.GetRecentActivitiesResponse;

import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;

import java.util.concurrent.TimeUnit;

public class ActivityGrpcClient {

    private final ManagedChannel channel;
    private final ActivityServiceGrpc.ActivityServiceBlockingStub blockingStub;

    public ActivityGrpcClient(String host, int port) {
        this.channel = ManagedChannelBuilder.forAddress(host, port)
                .usePlaintext()  // In production, replace with TLS
                .build();
        this.blockingStub = ActivityServiceGrpc.newBlockingStub(channel);
    }

    public ActivityResponse createActivity(String jwtToken, Long userId, String title, String description) {
        JwtClientInterceptor authInterceptor = new JwtClientInterceptor(jwtToken);
        ActivityServiceGrpc.ActivityServiceBlockingStub stubWithAuth = blockingStub.withInterceptors(authInterceptor);

        CreateActivityRequest request = CreateActivityRequest.newBuilder()
                .setUserId(userId)
                .setTitle(title)
                .setDescription(description)
                .build();

        return stubWithAuth.createActivity(request);
    }

    public GetRecentActivitiesResponse getRecentActivities(String jwtToken, Long userId, int page, int size) {
        JwtClientInterceptor authInterceptor = new JwtClientInterceptor(jwtToken);
        ActivityServiceGrpc.ActivityServiceBlockingStub stubWithAuth = blockingStub.withInterceptors(authInterceptor);

        GetRecentActivitiesRequest request = GetRecentActivitiesRequest.newBuilder()
                .setUserId(userId)
                .setPage(page)
                .setSize(size)
                .build();

        return stubWithAuth.getRecentActivities(request);
    }

    public void shutdown() throws InterruptedException {
        channel.shutdown().awaitTermination(5, TimeUnit.SECONDS);
    }
}


