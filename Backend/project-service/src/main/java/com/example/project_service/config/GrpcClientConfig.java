package com.example.project_service.config;

import com.example.project_service.client.ActivityGrpcClient;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GrpcClientConfig {

    @Value("${grpc.server.activity-address}")
    private String activity_host;

    @Value("${grpc.server.activity-port}")
    private int activity_port;





    @Bean
    public ActivityGrpcClient activityGrpcClient() {
        return new ActivityGrpcClient(activity_host, activity_port);
    }


}
