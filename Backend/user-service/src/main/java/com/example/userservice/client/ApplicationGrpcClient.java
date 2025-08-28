package com.example.userservice.client;
import com.example.activity_service.gRPC.ActivityResponse;
import com.example.activity_service.gRPC.ActivityServiceGrpc;
import com.example.activity_service.gRPC.CreateActivityRequest;
import com.example.activity_service.gRPC.GetRecentActivitiesRequest;
import com.example.activity_service.gRPC.GetRecentActivitiesResponse;
import com.example.application_service.gRPC.ApplicationCountRequest;
import com.example.application_service.gRPC.ApplicationCountResponse;
import com.example.application_service.gRPC.ApplicationServiceGrpc;

import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;

import java.util.concurrent.TimeUnit;

public class ApplicationGrpcClient {

    private final ManagedChannel channel;
    private final ApplicationServiceGrpc.ApplicationServiceBlockingStub blockingStub;

    public ApplicationGrpcClient(String host, int port) {
        this.channel = ManagedChannelBuilder.forAddress(host, port)
                .usePlaintext()  // In production, replace with TLS
                .build();
        this.blockingStub = ApplicationServiceGrpc.newBlockingStub(channel);
    }

    public ApplicationCountResponse getApplicationStats(String jwtToken) {
        JwtClientInterceptor authInterceptor = new JwtClientInterceptor(jwtToken);
        ApplicationServiceGrpc.ApplicationServiceBlockingStub stubWithAuth = blockingStub.withInterceptors(authInterceptor);

        ApplicationCountRequest request = ApplicationCountRequest.newBuilder()
                .build();

        return stubWithAuth.getApplicationCount(request);
    }

    public void shutdown() throws InterruptedException {
        channel.shutdown().awaitTermination(5, TimeUnit.SECONDS);
    }
}




