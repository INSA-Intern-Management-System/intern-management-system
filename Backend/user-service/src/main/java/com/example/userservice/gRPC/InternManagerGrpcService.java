package com.example.userservice.gRPC;

import com.example.userservice.model.InternManager;
import com.example.userservice.repository.InternManagerReposInterface;
import com.example.userservice.security.JwtServerInterceptor;

import io.grpc.stub.StreamObserver;

public class InternManagerGrpcService extends InternManagerServiceGrpc.InternManagerServiceImplBase {

    private final InternManagerReposInterface repository;

    public InternManagerGrpcService(InternManagerReposInterface repository) {
        this.repository = repository;
        System.out.println("✅ InternManagerGrpcService created!");
    }

    @Override
    public void getInternManagerInfo(InternManagerRequest request, StreamObserver<InternManagerResponse> responseObserver) {
        Long userIdFromContext = JwtServerInterceptor.getUserId();
        Long userIdToUse = (userIdFromContext != null) ? userIdFromContext : request.getUserId();

        InternManager internManager = repository.getInfo(userIdToUse);

        if (internManager == null) {
            responseObserver.onError(new RuntimeException("Intern info not found"));
            return;
        }

        InternManagerResponse response = InternManagerResponse.newBuilder()
                .setId(internManager.getId())
                .setUserId(internManager.getUser() != null ? internManager.getUser().getId() : 0)
                .setManagerId(internManager.getManager() != null ? internManager.getManager().getId() : 0)
                .setProjectId(internManager.getProject() != null ? internManager.getProject().getId() : 0)
                .setMentorId(internManager.getMentor() != null ? internManager.getMentor().getId() : 0)
                .setTeamId(internManager.getTeam() != null ? internManager.getTeam().getId() : 0)
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    // @Override
    // public void searchByName(UserRequest request, StreamObserver<UserResponse> responseObserver) {
    //     if (request.getFirstName().isEmpty() || request.getRole().isEmpty()) {
    //         responseObserver.onError(new RuntimeException("First name and role must be provided"));
    //         return;
    //     }
    //     List<User> users = repository.searchByName(request.getFirstName(), request.getRole());

    //     for (User user : users) {
    //         UserResponse response = UserResponse.newBuilder()
    //                 .setId(user.getId())
    //                 .setFirstName(user.getFirstName())
    //                 .setLastName(user.getLastName())
    //                 .build();
    //         responseObserver.onNext(response);
    //         }

    //     responseObserver.onCompleted();

    //     }

}

