//package com.example.notification_service.config;
//
//import com.example.notification_service.gRPC.NotificationGrpcServer;
//import com.example.notification_service.repository.NotificationRepository;
////import com.example.notification_service.grpc.ApplicationServiceGrpc;
//import io.grpc.Server;
//import io.grpc.netty.shaded.io.grpc.netty.NettyServerBuilder;
//import jakarta.annotation.PostConstruct;
//import jakarta.annotation.PreDestroy;
//import org.springframework.stereotype.Component;
//
//import java.net.InetSocketAddress;
//import java.util.concurrent.TimeUnit;
//
//@Component
//public class GrpcServerRunner {
//
//    private final NotificationRepository notificationRepository;
//    private final GrpcProperties grpcProperties;
//    private Server server;
//
//    public GrpcServerRunner(NotificationRepository notificationRepository,
//                            GrpcProperties grpcProperties) {
//        this.notificationRepository = notificationRepository;
//        this.grpcProperties = grpcProperties;
//    }
//
//    @PostConstruct
//    public void start() throws Exception {
//        NettyServerBuilder builder = NettyServerBuilder
//                .forAddress(new InetSocketAddress(grpcProperties.getAddress(), grpcProperties.getPort()))
//                .maxInboundMessageSize(grpcProperties.getMaxMessageSize())
//                .permitKeepAliveTime(5, TimeUnit.SECONDS);
//
//        // Register ApplicationGrpcService (no JWT interceptor unless you need auth)
//        builder.addService(new NotificationGrpcServer(notificationRepository));
//
//        server = builder.build().start();
//
//        System.out.println("✅ notification-service gRPC server started on "
//                + grpcProperties.getAddress() + ":" + grpcProperties.getPort());
//
//        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
//            try {
//                stop();
//            } catch (InterruptedException e) {
//                Thread.currentThread().interrupt();
//            }
//        }));
//    }
//
//    @PreDestroy
//    public void stop() throws InterruptedException {
//        if (server != null) {
//            System.out.println("⏳ Shutting down notification-service gRPC server...");
//            server.shutdown();
//            if (!server.awaitTermination(10, TimeUnit.SECONDS)) {
//                System.out.println("⚠️ Timed out waiting, forcing shutdown now.");
//                server.shutdownNow();
//            }
//            System.out.println("✅ notification-service gRPC server stopped.");
//        }
//    }
//}
