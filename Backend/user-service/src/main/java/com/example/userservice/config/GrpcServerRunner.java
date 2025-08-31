package com.example.userservice.config;

import com.example.userservice.gRPC.InternManagerGrpcService;
import com.example.userservice.gRPC.UserGrpcService;
import com.example.userservice.repository.*;
import com.example.userservice.security.JwtServerInterceptor;
import io.grpc.Server;
import io.grpc.ServerInterceptors;
import io.grpc.netty.shaded.io.grpc.netty.NettyServerBuilder;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.net.InetSocketAddress;
import java.util.concurrent.TimeUnit;

@Component
public class GrpcServerRunner {

    private final InternManagerReposInterface repository;
    private final UserMessageInterface userMessageInterface;
    private final UserRepository userRepo;
    private final SystemSettingRepository systemRepo;
    private final RoleRepository roleRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtServerInterceptor jwtInterceptor;
    private final GrpcProperties grpcProperties;

    private Server server;

    public GrpcServerRunner(InternManagerReposInterface repository,
                            UserMessageInterface userMessageInterface,
                            UserRepository userRepo,
                            SystemSettingRepository systemRepo,
                            PasswordEncoder passwordEncoder,
                            RoleRepository roleRepo,
                            JwtServerInterceptor jwtInterceptor,
                            GrpcProperties grpcProperties) {
        this.repository = repository;
        this.roleRepo = roleRepo;
        this.systemRepo = systemRepo;
        this.passwordEncoder = passwordEncoder;
        this.userRepo = userRepo;

        this.userMessageInterface = userMessageInterface;
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
                new InternManagerGrpcService(repository),
                jwtInterceptor
        ));
        builder.addService(ServerInterceptors.intercept(
                new UserGrpcService(userMessageInterface, roleRepo,passwordEncoder,systemRepo, userRepo),
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
