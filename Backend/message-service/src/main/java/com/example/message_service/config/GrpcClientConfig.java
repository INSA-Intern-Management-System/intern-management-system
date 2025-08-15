package com.example.message_service.config;

import com.example.message_service.client.UserGrpcClient;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GrpcClientConfig {

    @Value("${grpc.server.user-address}")
    private String activity_host;

    @Value("${grpc.server.user-port}")
    private int activity_port;


    @Bean
    public UserGrpcClient userGrpcClient() {
        return new UserGrpcClient(activity_host, activity_port);
    }


}
