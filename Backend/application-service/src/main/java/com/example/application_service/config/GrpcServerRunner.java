package com.example.application_service.config;

import com.example.application_service.gRPC.ApplicationGrpcService;
import com.example.application_service.repository.ApplicationRepository;
import com.example.applicationservice.grpc.ApplicationServiceGrpc;
import io.grpc.Server;
import io.grpc.netty.shaded.io.grpc.netty.NettyServerBuilder;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.stereotype.Component;

import java.net.InetSocketAddress;
import java.util.concurrent.TimeUnit;

@Component
public class GrpcServerRunner {

    private final ApplicationRepository applicationRepository;
    private final GrpcProperties grpcProperties;
    private Server server;

    public GrpcServerRunner(ApplicationRepository applicationRepository,
                            GrpcProperties grpcProperties) {
        this.applicationRepository = applicationRepository;
        this.grpcProperties = grpcProperties;
    }

    @PostConstruct
    public void start() throws Exception {
        NettyServerBuilder builder = NettyServerBuilder
                .forAddress(new InetSocketAddress(grpcProperties.getAddress(), grpcProperties.getPort()))
                .maxInboundMessageSize(grpcProperties.getMaxMessageSize())
                .permitKeepAliveTime(5, TimeUnit.SECONDS);

        // Register ApplicationGrpcService (no JWT interceptor unless you need auth)
        builder.addService(new ApplicationGrpcService(applicationRepository));

        server = builder.build().start();

        System.out.println("✅ Application-service gRPC server started on "
                + grpcProperties.getAddress() + ":" + grpcProperties.getPort());

        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            try {
                stop();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }));
    }

    @PreDestroy
    public void stop() throws InterruptedException {
        if (server != null) {
            System.out.println("⏳ Shutting down application-service gRPC server...");
            server.shutdown();
            if (!server.awaitTermination(10, TimeUnit.SECONDS)) {
                System.out.println("⚠️ Timed out waiting, forcing shutdown now.");
                server.shutdownNow();
            }
            System.out.println("✅ Application-service gRPC server stopped.");
        }
    }
}
