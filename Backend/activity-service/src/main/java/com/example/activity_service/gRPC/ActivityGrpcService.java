package com.example.activity_service.gRPC;

import com.example.activity_service.model.Activity;
import com.example.activity_service.model.User;
import com.example.activity_service.repository.ActivityJpaInterface;
import com.example.activity_service.gRPC.ActivityServiceGrpc.ActivityServiceImplBase;
import com.example.activity_service.security.JwtServerInterceptor;

import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

public class ActivityGrpcService extends ActivityServiceImplBase {

    private static final Logger logger = LoggerFactory.getLogger(ActivityGrpcService.class);
    private final ActivityJpaInterface repository;

    public ActivityGrpcService(ActivityJpaInterface repository) {
        this.repository = repository;
        logger.info("✅ ActivityGrpcService created!");
    }

    @Override
    public void createActivity(CreateActivityRequest request, StreamObserver<ActivityResponse> responseObserver) {
        try {
            // Validate input
            if (request.getTitle() == null || request.getTitle().isBlank()) {
                responseObserver.onError(Status.INVALID_ARGUMENT.withDescription("Title must not be empty").asRuntimeException());
                return;
            }
            if (request.getDescription() == null || request.getDescription().isBlank()) {
                responseObserver.onError(Status.INVALID_ARGUMENT.withDescription("Description must not be empty").asRuntimeException());
                return;
            }

            // Get user ID
            Long userIdFromContext = JwtServerInterceptor.getUserId();
            Long userIdToUse = (userIdFromContext != null) ? userIdFromContext : request.getUserId();

            // Build and save activity
            Activity activity = new Activity();
            activity.setTitle(request.getTitle());
            activity.setDescription(request.getDescription());
            activity.setUser(new User(userIdToUse)); // lightweight reference

            Activity saved = repository.save(activity);

            // Build response
            ActivityResponse response = ActivityResponse.newBuilder()
                    .setId(saved.getId())
                    .setUserId(userIdToUse)
                    .setTitle(saved.getTitle())
                    .setDescription(saved.getDescription())
                    .setCreatedAt(saved.getCreatedAt().toString())
                    .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();

            logger.info("✅ Activity created: id={}, userId={}", saved.getId(), userIdToUse);

        } catch (Exception ex) {
            logger.error("❌ Failed to create activity", ex);
            responseObserver.onError(Status.INTERNAL.withDescription("Failed to create activity").withCause(ex).asRuntimeException());
        }
    }

    @Override
    public void getRecentActivities(GetRecentActivitiesRequest request, StreamObserver<GetRecentActivitiesResponse> responseObserver) {
        try {
            // Get user ID
            Long userIdFromContext = JwtServerInterceptor.getUserId();
            Long userIdToUse = (userIdFromContext != null) ? userIdFromContext : request.getUserId();

            // Validate pagination
            int page = Math.max(0, request.getPage());
            int size = Math.max(1, request.getSize());

            // Query DB
            Page<Activity> activityPage = repository.findByUser_IdOrderByCreatedAtDesc(userIdToUse, PageRequest.of(page, size));

            // Build response
            GetRecentActivitiesResponse.Builder responseBuilder = GetRecentActivitiesResponse.newBuilder()
                    .setTotalPages(activityPage.getTotalPages())
                    .setTotalElements(activityPage.getTotalElements())
                    .setCurrentPage(activityPage.getNumber());

            for (Activity activity : activityPage.getContent()) {
                ActivityResponse activityResponse = ActivityResponse.newBuilder()
                        .setId(activity.getId())
                        .setUserId(userIdToUse)
                        .setTitle(activity.getTitle())
                        .setDescription(activity.getDescription())
                        .setCreatedAt(activity.getCreatedAt().toString())
                        .build();
                responseBuilder.addActivities(activityResponse);
            }

            responseObserver.onNext(responseBuilder.build());
            responseObserver.onCompleted();

            logger.info("✅ Returned {} activities for userId={}", activityPage.getNumberOfElements(), userIdToUse);

        } catch (Exception ex) {
            logger.error("❌ Failed to get recent activities", ex);
            responseObserver.onError(Status.INTERNAL.withDescription("Failed to get recent activities").withCause(ex).asRuntimeException());
        }
    }
}
