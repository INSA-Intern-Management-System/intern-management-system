package com.yourcompany.activityservice.service;

import com.example.activity_service.model.Activity;
import com.example.activity_service.repository.ActivityRepository;
import com.example.activity_service.ActivityServiceGrpc;
import com.example.activity_service.ActivityItem;
import com.example.activity_service.CreateActivityRequest;
import com.example.activity_service.CreateActivityResponse;
import com.example.activity_service.GetRecentActivitiesRequest;
import com.example.activity_service.GetRecentActivitiesResponse;
import com.example.activity_service.GetUserActivitiesRequest;
import com.example.activity_service.GetUserActivitiesResponse;
import com.google.protobuf.Timestamp;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.grpc.server.service.GrpcService;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset; // For UTC conversion
import java.util.List;
import java.util.stream.Collectors;

@GrpcService
public class ActivityServiceImpl extends ActivityServiceGrpc.ActivityServiceImplBase {

    @Autowired
    private ActivityRepository activityRepository;

    @Override
    public void createActivity(CreateActivityRequest request,
                               StreamObserver<CreateActivityResponse> responseObserver) {
        try {
            Activity activity = new Activity();
            activity.setUserId(request.getUserId());
            activity.setTitle(request.getTitle());
            activity.setDescription(request.getDescription());
            activity.setCreatedAt(LocalDateTime.now()); // Server sets creation time

            Activity savedActivity = activityRepository.save(activity);

            CreateActivityResponse response = CreateActivityResponse.newBuilder()
                    .setActivityId(savedActivity.getId())
                    .setSuccess(true)
                    .setMessage("Activity created successfully")
                    .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();

        } catch (Exception e) {
            System.err.println("Error creating activity: " + e.getMessage());
            CreateActivityResponse response = CreateActivityResponse.newBuilder()
                    .setSuccess(false)
                    .setMessage("Failed to create activity: " + e.getMessage())
                    .build();
            responseObserver.onNext(response);
            responseObserver.onCompleted(); // Or responseObserver.onError(Status.INTERNAL.withCause(e).asRuntimeException());
        }
    }

    @Override
    public void getRecentActivities(GetRecentActivitiesRequest request,
                                    StreamObserver<GetRecentActivitiesResponse> responseObserver) {
        List<Activity> recentActivities = activityRepository.findTopNByOrderByCreatedAtDesc(request.getLimit());

        List<ActivityItem> activityItems = recentActivities.stream()
                .map(activity -> ActivityItem.newBuilder()
                        .setId(activity.getId())
                        .setUserId(activity.getUserId())
                        .setTitle(activity.getTitle())
                        .setDescription(activity.getDescription())
                        // Convert LocalDateTime to Google Protobuf Timestamp
                        .setCreatedAt(Timestamp.newBuilder()
                                .setSeconds(activity.getCreatedAt().toEpochSecond(ZoneOffset.UTC))
                                .setNanos(activity.getCreatedAt().getNano())
                                .build())
                        .build())
                .collect(Collectors.toList());

        GetRecentActivitiesResponse response = GetRecentActivitiesResponse.newBuilder()
                .addAllActivities(activityItems)
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void getUserActivities(GetUserActivitiesRequest request,
                                  StreamObserver<GetUserActivitiesResponse> responseObserver) {
        List<Activity> userActivities = activityRepository.findByUserIdOrderByCreatedAtDesc(request.getUserId());

        List<ActivityItem> activityItems = userActivities.stream()
                .map(activity -> ActivityItem.newBuilder()
                        .setId(activity.getId())
                        .setUserId(activity.getUserId())
                        .setTitle(activity.getTitle())
                        .setDescription(activity.getDescription())
                        .setCreatedAt(Timestamp.newBuilder()
                                .setSeconds(activity.getCreatedAt().toEpochSecond(ZoneOffset.UTC))
                                .setNanos(activity.getCreatedAt().getNano())
                                .build())
                        .build())
                .collect(Collectors.toList());

        GetUserActivitiesResponse response = GetUserActivitiesResponse.newBuilder()
                .addAllActivities(activityItems)
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}