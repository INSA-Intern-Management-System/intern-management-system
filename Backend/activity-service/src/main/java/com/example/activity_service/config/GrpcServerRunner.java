package com.example.activity_service.config;
import com.example.activity_service.gRPC.ActivityGrpcService;
import com.example.activity_service.repository.ActivityJpaInterface;
import com.example.activity_service.security.JwtServerInterceptor;

import io.grpc.Server;
import io.grpc.ServerInterceptors;
import io.grpc.netty.shaded.io.grpc.netty.NettyServerBuilder;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.stereotype.Component;

import java.net.InetSocketAddress;
import java.util.concurrent.TimeUnit;

@Component
public class GrpcServerRunner {

    private final ActivityJpaInterface repository;
    private final JwtServerInterceptor jwtInterceptor;
    private final GrpcProperties grpcProperties;

    private Server server;

    public GrpcServerRunner(ActivityJpaInterface repository,
                            JwtServerInterceptor jwtInterceptor,
                            GrpcProperties grpcProperties) {
        this.repository = repository;
        this.jwtInterceptor = jwtInterceptor;
        this.grpcProperties = grpcProperties;
    }

    @PostConstruct
    public void start() throws Exception {
        server = NettyServerBuilder
                .forAddress(new InetSocketAddress(grpcProperties.getAddress(), grpcProperties.getPort()))
                .maxInboundMessageSize(grpcProperties.getMaxMessageSize())
                .permitKeepAliveTime(5, TimeUnit.SECONDS)
                .addService(ServerInterceptors.intercept(
                        new ActivityGrpcService(repository),
                        jwtInterceptor
                ))
                .build()
                .start();

        System.out.println("✅ gRPC server started on " 
            + grpcProperties.getAddress() + ":" + grpcProperties.getPort());

        Runtime.getRuntime().addShutdownHook(new Thread(this::stop));
    }

    @PreDestroy
    public void stop() {
        if (server != null) {
            server.shutdown();
            System.out.println("✅ gRPC server stopped.");
        }
    }
}

