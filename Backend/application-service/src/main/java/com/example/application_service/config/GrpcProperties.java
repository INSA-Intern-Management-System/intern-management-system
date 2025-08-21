package com.example.application_service.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "grpc.server")
public class GrpcProperties {
    private String address;
    private int port;
    private int maxMessageSize;

    // getters and setters
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public int getPort() { return port; }
    public void setPort(int port) { this.port = port; }

    public int getMaxMessageSize() { return maxMessageSize; }
    public void setMaxMessageSize(int maxMessageSize) { this.maxMessageSize = maxMessageSize; }
}



