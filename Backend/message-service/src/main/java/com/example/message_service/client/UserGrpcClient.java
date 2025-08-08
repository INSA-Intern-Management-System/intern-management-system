package com.example.message_service.client;

import com.example.userservice.gRPC.*;

import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;

import java.util.List;
import java.util.concurrent.TimeUnit;

public class UserGrpcClient {

    private final ManagedChannel channel;
    private final UserServiceGrpc.UserServiceBlockingStub blockingStub;

    public UserGrpcClient(String host, int port) {
        this.channel = ManagedChannelBuilder.forAddress(host, port)
                .usePlaintext() // In production, use TLS
                .build();
        this.blockingStub = UserServiceGrpc.newBlockingStub(channel);
    }

    public UserResponse getUserById(String jwtToken, Long userId) {
        try{
            JwtClientInterceptor authInterceptor = new JwtClientInterceptor(jwtToken);
            UserServiceGrpc.UserServiceBlockingStub stubWithAuth = blockingStub.withInterceptors(authInterceptor);

            UserRequest request = UserRequest.newBuilder()
                    .setUserId(userId)
                    .build();

            return stubWithAuth.getUser(request);
        }catch(Exception e){
            System.out.println("error: "+ e.getMessage());
        
            return null;
        }
        
    }

    public UsersResponse getAllUsers(String jwtToken, List<Long> ids) {
        JwtClientInterceptor authInterceptor = new JwtClientInterceptor(jwtToken);
        UserServiceGrpc.UserServiceBlockingStub stubWithAuth = blockingStub.withInterceptors(authInterceptor);

        UserIdsRequest.Builder requestBuilder = UserIdsRequest.newBuilder();

        for (Long id : ids) {
            requestBuilder.addUserIds(id);
        }

        UserIdsRequest request = requestBuilder.build();

        return stubWithAuth.getUsersByIds(request);
}


    public SearchByNameResponse searchByName(String jwtToken, String keyword, int page, int size) {
        JwtClientInterceptor authInterceptor = new JwtClientInterceptor(jwtToken);
        UserServiceGrpc.UserServiceBlockingStub stubWithAuth = blockingStub.withInterceptors(authInterceptor);

        SearchByNameRequest request = SearchByNameRequest.newBuilder()
                .setKeyword(keyword)
                .setPage(page)
                .setSize(size)
                .build();

        return stubWithAuth.searchByName(request);
    }

    public void shutdown() throws InterruptedException {
        channel.shutdown().awaitTermination(5, TimeUnit.SECONDS);
    }
}
