package com.example.notification_service.gRPC;

import com.example.grpc.NotificationRequest;
import com.example.grpc.NotificationResponse;
import com.example.grpc.NotificationServiceGrpc;
import com.example.grpc.RecipientRole;
import com.example.notification_service.model.Notification;
import com.example.notification_service.repository.NotificationRepository;
import com.example.notification_service.repository.NotificationRepository;
import com.google.protobuf.Timestamp;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.Instant;
import java.time.ZoneId;
import java.util.Set;
import java.util.stream.Collectors;

@GrpcService
public class NotificationGrpcServer extends NotificationServiceGrpc.NotificationServiceImplBase {

    @Autowired
    private NotificationRepository repository;

    @Override
    public void createNotification(NotificationRequest request, StreamObserver<NotificationResponse> responseObserver) {

        Notification notification = new Notification();

        // Map proto enum list to Java enum set
        Set<com.example.notification_service.model.RecipientRole> javaRoles = request.getRolesList().stream()
                .map(protoRole -> com.example.notification_service.model.RecipientRole.valueOf(protoRole.name()))
                .collect(Collectors.toSet());

        notification.setRoles(javaRoles);
        notification.setTitle(request.getTitle());
        notification.setDescription(request.getDescription());

        Timestamp ts = request.getCreatedAt();
        Instant createdAt = Instant.ofEpochSecond(ts.getSeconds(), ts.getNanos());
        notification.setCreatedAt(createdAt.atZone(ZoneId.systemDefault()).toLocalDateTime());

        repository.save(notification);

        NotificationResponse response = NotificationResponse.newBuilder()
                .setSuccess(true)
                .setMessage("Notification created and saved.")
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }


}
