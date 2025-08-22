package com.example.application_service.gRPC;

import com.example.userservice.gRPC.CreateUserRequest;
import com.example.userservice.gRPC.CreateUserResponse;
import com.example.userservice.gRPC.UserServiceGrpc;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import io.grpc.Metadata;
import io.grpc.stub.MetadataUtils;
import org.springframework.stereotype.Component;

@Component
public class UserServiceClient {

    private final UserServiceGrpc.UserServiceBlockingStub stub;
    private final ManagedChannel channel;

    public UserServiceClient(String host, int port) {
        this.channel = ManagedChannelBuilder
                .forAddress(host, port)
                .usePlaintext()
                .build();
        this.stub = UserServiceGrpc.newBlockingStub(channel);
    }

    public CreateUserResponse registerUser(CreateUserRequest request, String jwtToken) {
        // Create metadata with a custom key for the token
        Metadata metadata = new Metadata();
        Metadata.Key<String> cookieTokenKey = Metadata.Key.of("access-token", Metadata.ASCII_STRING_MARSHALLER);
        metadata.put(cookieTokenKey, jwtToken.trim());

        // Attach metadata to stub
        UserServiceGrpc.UserServiceBlockingStub stubWithAuth = MetadataUtils.attachHeaders(stub, metadata);

        return stubWithAuth.createUser(request);
    }

    public void shutdown() {
        if (channel != null && !channel.isShutdown()) {
            channel.shutdown();
        }
    }
}