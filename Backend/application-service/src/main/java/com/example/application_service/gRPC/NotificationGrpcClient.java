package com.example.application_service.gRPC;

import com.example.grpc.NotificationRequest;
import com.example.grpc.NotificationResponse;
import com.example.grpc.NotificationServiceGrpc;
import com.example.grpc.RecipientRole;
import com.example.grpc.NotificationType;
import com.google.protobuf.Timestamp;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class NotificationGrpcClient {

    private final NotificationServiceGrpc.NotificationServiceBlockingStub notificationStub;

    public NotificationGrpcClient(String host, int port) {
        ManagedChannel channel = ManagedChannelBuilder.forAddress(host,port)
                .usePlaintext()
                .build();

        notificationStub = NotificationServiceGrpc.newBlockingStub(channel);
    }

    public void sendNotification(Set<RecipientRole> roles, String title, String description,
                                 Instant createdAt, NotificationType notificationType) {
        Timestamp ts = Timestamp.newBuilder()
                .setSeconds(createdAt.getEpochSecond())
                .setNanos(createdAt.getNano())
                .build();

        NotificationRequest request = NotificationRequest.newBuilder()
                .addAllRoles(roles.stream()
                        .map(role -> RecipientRole.valueOf(role.name()))
                        .collect(Collectors.toList()))
                .setTitle(title)
                .setDescription(description)
                .setCreatedAt(ts)
                .setNotificationType(notificationType)
                .build();

        NotificationResponse response = notificationStub.createNotification(request);
        System.out.println("Notification status: " + response.getMessage());
    }
}
