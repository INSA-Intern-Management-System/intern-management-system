package com.example.application_service.config;


import com.example.application_service.gRPC.NotificationGrpcClient;

import com.example.application_service.gRPC.UserServiceClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GrpcClientConfig {
    @Value("${grpc.server.notification-address}")
    private String notification_host;

    @Value("${grpc.server.notification-port}")
    private int notification_port;

    @Value("${grpc.server.user-address}")
    private String user_host;

    @Value("${grpc.server.user-port}")
    private int user_port;


    @Bean
    public NotificationGrpcClient notificationGrpcClient() {
        return new NotificationGrpcClient(notification_host, notification_port);
    }
    @Bean
    public UserServiceClient userServiceClient() {
        return new UserServiceClient(user_host, user_port);
    }

}


