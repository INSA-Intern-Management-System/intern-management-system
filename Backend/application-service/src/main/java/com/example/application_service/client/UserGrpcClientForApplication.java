package com.example.application_service.client;


import com.example.application_service.model.Applicant;
import com.example.userservice.gRPC.*;

import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import io.grpc.StatusRuntimeException;

import java.util.List;
import java.util.concurrent.TimeUnit;

public class UserGrpcClientForApplication {

    private final ManagedChannel channel;
    private final UserServiceGrpc.UserServiceBlockingStub blockingStub;

    public UserGrpcClientForApplication(String host, int port) {
        this.channel = ManagedChannelBuilder.forAddress(host, port)
                .usePlaintext() // In production, use TLS
                .build();
        this.blockingStub = UserServiceGrpc.newBlockingStub(channel);
    }

    public CreateUserResponse RegisterUser(String jwtToken, Applicant applicant) {
        try {
            JwtClientInterceptor authInterceptor = new JwtClientInterceptor(jwtToken);
            UserServiceGrpc.UserServiceBlockingStub stubWithAuth = blockingStub.withInterceptors(authInterceptor);

            CreateUserRequest request = CreateUserRequest.newBuilder()
                    .setFirstName(applicant.getFirstName())
                    .setLastName(applicant.getLastName())
                    .setEmail(applicant.getEmail())
                    .setPhoneNumber(applicant.getPhoneNumber())
                    .setFieldOfStudy(applicant.getFieldOfStudy())
                    .setInstitution(applicant.getInstitution())
                    .setGender(applicant.getGender())
                    .setDuration(applicant.getDuration())
                    .setLinkedInUrl(applicant.getLinkedInUrl())
                    .setGithubUrl(applicant.getGithubUrl())
                    .setCvUrl(applicant.getCvUrl())
                    .setRole("STUDENT")
                    .build();
            return stubWithAuth.createUser(request);
        } catch (Exception e) {
            System.err.println("RPC failed: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    public void shutdown() throws InterruptedException {
        channel.shutdown().awaitTermination(5, TimeUnit.SECONDS);
    }
}


