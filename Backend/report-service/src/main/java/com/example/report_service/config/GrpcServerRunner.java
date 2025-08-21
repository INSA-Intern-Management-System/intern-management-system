package com.example.report_service.config;

import io.grpc.Server;
import io.grpc.ServerInterceptors;
import io.grpc.netty.shaded.io.grpc.netty.NettyServerBuilder;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.stereotype.Component;

import com.example.report_service.gRPC.ReportGrpcService;
import com.example.report_service.security.JwtServerInterceptor;
import com.example.report_service.service.ReportService;

import java.net.InetSocketAddress;
import java.util.concurrent.TimeUnit;

@Component
public class GrpcServerRunner {

    private final ReportService service;
    private final JwtServerInterceptor jwtInterceptor;
    private final GrpcProperties grpcProperties;

    private Server server;

    public GrpcServerRunner(ReportService service,
                            JwtServerInterceptor jwtInterceptor,
                            GrpcProperties grpcProperties) {
        this.service = service;
        this.jwtInterceptor = jwtInterceptor;
        this.grpcProperties = grpcProperties;
    }

    @PostConstruct
    public void start() throws Exception {
        NettyServerBuilder builder = NettyServerBuilder
                .forAddress(new InetSocketAddress(grpcProperties.getAddress(), grpcProperties.getPort()))
                .maxInboundMessageSize(grpcProperties.getMaxMessageSize())
                .permitKeepAliveTime(5, TimeUnit.SECONDS);

        // Register each service separately, with the JWT interceptor applied
        builder.addService(ServerInterceptors.intercept(
                new ReportGrpcService(service),
                jwtInterceptor
        ));
    

        server = builder.build().start();

        System.out.println("✅ gRPC server started on "
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
            System.out.println("⏳ Shutting down gRPC server...");
            server.shutdown();
            if (!server.awaitTermination(10, TimeUnit.SECONDS)) {
                System.out.println("⚠️ Timed out waiting for gRPC server to shutdown, forcing now.");
                server.shutdownNow();
            }
            System.out.println("✅ gRPC server stopped.");
        }
    }
}

