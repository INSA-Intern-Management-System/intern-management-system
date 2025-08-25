package com.example.userservice.config;


import com.example.userservice.client.ActivityGrpcClient;
import com.example.userservice.client.ApplicationGrpcClient;
import com.example.userservice.client.ProjectManagerGrpcClient;
import com.example.userservice.client.ReportGrpcClient;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GrpcClientConfig {
    @Value("${grpc.server.project-address}")
    private String project_host;

    @Value("${grpc.server.project-port}")
    private int project_port;

    @Value("${grpc.server.activity-address}")
    private String activity_host;

    @Value("${grpc.server.activity-port}")
    private int activity_port;

    @Value("${grpc.server.report-address}")
    private String report_host;

    @Value("${grpc.server.report-port}")
    private int report_port;

    @Value("${grpc.server.application-address}")
    private String application_host;

    @Value("${grpc.server.application-port}")
    private int application_port;

    @Bean
    public ActivityGrpcClient activityGrpcClient() {
        return new ActivityGrpcClient(activity_host, activity_port);
    }
    @Bean
    public ProjectManagerGrpcClient projectManagerGrpcClient() {
        return new ProjectManagerGrpcClient(project_host, project_port);
    }

    @Bean
    public ReportGrpcClient reportGrpcClient() {
        return new ReportGrpcClient(report_host, report_port);
    }
    
    @Bean
    public ApplicationGrpcClient applicationGrpcClient() {
        return new ApplicationGrpcClient(application_host, application_port);
    }

}

