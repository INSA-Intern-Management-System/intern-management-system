package com.example.report_service.client;

import com.example.userservice.gRPC.InternManagerServiceGrpc;
import com.example.userservice.gRPC.UserRequest;
import com.example.userservice.gRPC.UserResponse;

import java.util.concurrent.TimeUnit;

import com.example.userservice.gRPC.InternManagerRequest;
import com.example.userservice.gRPC.InternManagerResponse;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;

public class InternManagerGrpcClient {
    private final ManagedChannel channel;
    private final InternManagerServiceGrpc.InternManagerServiceBlockingStub blockingStub;

    public InternManagerGrpcClient(String host, int port) {
        this.channel = ManagedChannelBuilder.forAddress(host, port)
                .usePlaintext()
                .build();
        this.blockingStub = InternManagerServiceGrpc.newBlockingStub(channel);
    }

    public InternManagerResponse getInternManagerByUserId(String jwtToken, Long userId) {
        // Create client interceptor with JWT token
        JwtClientInterceptor authInterceptor = new JwtClientInterceptor(jwtToken);
        InternManagerServiceGrpc.InternManagerServiceBlockingStub stubWithAuth =
                blockingStub.withInterceptors(authInterceptor);

        InternManagerRequest request = InternManagerRequest.newBuilder()
                .setUserId(userId)
                .build();

        return stubWithAuth.getInternManagerInfo(request);
    }

    public UserResponse searchByName(String jwtToken,String first_name,String Role) {
        // Create client interceptor with JWT token
        JwtClientInterceptor authInterceptor = new JwtClientInterceptor(jwtToken);
        InternManagerServiceGrpc.InternManagerServiceBlockingStub stubWithAuth =
                blockingStub.withInterceptors(authInterceptor);

        UserRequest request = UserRequest.newBuilder()
                .setFirstName(first_name)
                .setRole(Role)
                .build();

        return stubWithAuth.searchByName(request);
    }

    public void shutdown() throws InterruptedException {
        channel.shutdown().awaitTermination(5, TimeUnit.SECONDS);
    }
}

