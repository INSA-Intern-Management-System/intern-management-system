package com.example.leave_service.config;

import com.example.leave_service.client.ActivityGrpcClient;
import com.example.leave_service.client.UserGrpcClient;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GrpcClientConfig {

    @Value("${grpc.server.activity-address}")
    private String activity_host;

    @Value("${grpc.server.activity-port}")
    private int activity_port;

    @Value("${grpc.server.user-address}")
    private String user_host;

    @Value("${grpc.server.user-port}")
    private int user_port;





    @Bean
    public ActivityGrpcClient activityGrpcClient() {
        return new ActivityGrpcClient(activity_host, activity_port);
    }

    @Bean
    public UserGrpcClient userGrpcClient() {
        return new UserGrpcClient(user_host, user_port);
    }


}
