package com.example.project_service.config;
import com.example.project_service.repository.MilestoneReposInterface;
import com.example.project_service.repository.ProjectReposInterface;
import com.example.project_service.security.JwtServerInterceptor;
import io.grpc.Server;
import io.grpc.ServerInterceptors;
import io.grpc.netty.shaded.io.grpc.netty.NettyServerBuilder;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.stereotype.Component;
import com.example.project_service.gRPC.ProjectManagerGrpcService;

import java.net.InetSocketAddress;
import java.util.concurrent.TimeUnit;

@Component
public class GrpcServerRunner {

    private final ProjectReposInterface repository;
    private final MilestoneReposInterface mileRepos;
    private final JwtServerInterceptor jwtInterceptor;
    private final GrpcProperties grpcProperties;

    private Server server;

    public GrpcServerRunner(ProjectReposInterface repository,
                            MilestoneReposInterface mileRepos,
                            JwtServerInterceptor jwtInterceptor,
                            GrpcProperties grpcProperties) {
        this.repository = repository;
        this.mileRepos=mileRepos;
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
                        new ProjectManagerGrpcService(repository,mileRepos),
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


