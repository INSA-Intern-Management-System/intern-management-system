package com.example.report_service.config;

import com.example.report_service.client.ActivityGrpcClient;
import com.example.report_service.client.InternManagerGrpcClient;
import com.example.report_service.client.ProjectManagerGrpcClient;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GrpcClientConfig {

    @Value("${grpc.server.user-address}")
    private String user_host;

    @Value("${grpc.server.user-port}")
    private int user_port;

    @Value("${grpc.server.project-address}")
    private String project_host;

    @Value("${grpc.server.project-port}")
    private int project_port;

    @Value("${grpc.server.activity-address}")
    private String activity_host;

    @Value("${grpc.server.activity-port}")
    private int activity_port;

    @Bean
    public ActivityGrpcClient activityGrpcClient() {
        return new ActivityGrpcClient(activity_host, activity_port);
    }

    @Bean
    public InternManagerGrpcClient internManagerGrpcClient() {
        return new InternManagerGrpcClient(user_host, user_port);
    }

    @Bean
    public ProjectManagerGrpcClient projectManagerGrpcClient() {
        return new ProjectManagerGrpcClient(project_host, project_port);
    }
}
