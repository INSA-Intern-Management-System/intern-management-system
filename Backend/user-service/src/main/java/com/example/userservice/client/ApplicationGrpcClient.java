package com.example.userservice.client;

import com.example.applicationservice.grpc.ApplicationCountRequest;
import com.example.applicationservice.grpc.ApplicationCountResponse;
import com.example.applicationservice.grpc.ApplicationServiceGrpc;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class ApplicationGrpcClient {

    private final ApplicationServiceGrpc.ApplicationServiceBlockingStub stub;

    public ApplicationGrpcClient(
            @Value("${grpc.server.application-address}") String host,
            @Value("${grpc.server.application-port}") int port
    ) {
        ManagedChannel channel = ManagedChannelBuilder.forAddress(host, port)
                .usePlaintext()
                .build();

        stub = ApplicationServiceGrpc.newBlockingStub(channel);
    }

    public ApplicationCountResponse getApplicationCount() {
        ApplicationCountRequest request = ApplicationCountRequest.newBuilder().build();
        return stub.getApplicationCount(request);
    }
}
