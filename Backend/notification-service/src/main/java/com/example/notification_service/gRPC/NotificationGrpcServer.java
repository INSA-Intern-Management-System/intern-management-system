package com.example.notification_service.gRPC;

import com.example.grpc.NotificationRequest;
import com.example.grpc.NotificationResponse;
import com.example.grpc.NotificationServiceGrpc;
import com.example.notification_service.model.Notification;
import com.example.notification_service.model.NotificationRecipients;
import com.example.notification_service.model.RecipientRole;
import com.example.notification_service.repository.NotificationRepository;
import com.google.protobuf.Timestamp;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;

import java.time.Instant;
import java.time.ZoneId;
import java.util.Set;
import java.util.stream.Collectors;

@GrpcService
public class NotificationGrpcServer extends NotificationServiceGrpc.NotificationServiceImplBase {

    private final NotificationRepository repository;

    public NotificationGrpcServer(NotificationRepository repository) {
        this.repository = repository;
    }

    @Override
    public void createNotification(NotificationRequest request, StreamObserver<NotificationResponse> responseObserver) {

        Notification notification = new Notification();

        // Map roles
        Set<RecipientRole> javaRoles = request.getRolesList().stream()
                .map(protoRole -> RecipientRole.valueOf(protoRole.name()))
                .collect(Collectors.toSet());

        notification.setRoles(javaRoles);
        notification.setTitle(request.getTitle());
        notification.setDescription(request.getDescription());

        // Map NotificationType
        notification.setType(
                com.example.notification_service.model.NotificationType.valueOf(request.getNotificationType().name())
        );

        // Handle timestamp
        if (request.hasCreatedAt()) {
            Timestamp ts = request.getCreatedAt();
            Instant createdAt = Instant.ofEpochSecond(ts.getSeconds(), ts.getNanos());
            notification.setCreatedAt(createdAt.atZone(ZoneId.systemDefault()).toLocalDateTime());
        }

        // ✅ Create NotificationRecipients for each role
        javaRoles.forEach(role -> {
            NotificationRecipients recipient = new NotificationRecipients();
            recipient.setRole(role);
            recipient.setRead(false); // default unread
            recipient.setNotification(notification);
            notification.getRecipients().add(recipient);
        });

        // Save notification with recipients
        repository.save(notification);

        NotificationResponse response = NotificationResponse.newBuilder()
                .setSuccess(true)
                .setMessage("Notification created with recipients.")
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}
