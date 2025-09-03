package com.example.userservice.gRPC;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.example.userservice.dto.UserMessageDTO;
import com.example.userservice.model.InternManager;
import com.example.userservice.model.Project;
import com.example.userservice.model.Team;
import com.example.userservice.repository.InternManagerReposInterface;
import com.example.userservice.repository.UserMessageInterface;
import com.example.userservice.security.JwtServerInterceptor;

import io.grpc.stub.StreamObserver;

public class InternManagerGrpcService extends InternManagerServiceGrpc.InternManagerServiceImplBase {

    private final InternManagerReposInterface repository;
    private final UserMessageInterface userrepository;

    public InternManagerGrpcService(InternManagerReposInterface repository,UserMessageInterface userrepository) {
        this.repository = repository;
        this.userrepository = userrepository;
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

     @Override
    public void createInternManager(CreateRequest request, StreamObserver<CreateResponse> responseObserver) {
        try {
            List<Long> userIds = request.getUserIdsList();
            List<InternManager> internManagers=repository.createOrUpdateInternManagers(userIds, request.getProjectId(), request.getManagerId(), request.getTeamId());
            
            CreateResponse response = CreateResponse.newBuilder()
                    .setMessage(true)
                    .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();

        } catch (Exception e) {
            responseObserver.onError(new RuntimeException("Failed to create/update intern managers: " + e.getMessage()));
        }
    }

    @Override
    public void getUsersByIdsForReport(UserMultipleIdsRequest request, StreamObserver<MultiUsersResponse> responseObserver) {
        List<UserMessageDTO> users = userrepository.getUsersByIds(request.getUserIdsList());
        List<SingleUserResponse> userResponses = users.stream()
                .map(this::mapUserToUserResponse)
                .collect(Collectors.toList());

        MultiUsersResponse response = MultiUsersResponse.newBuilder()
                .addAllUsers(userResponses)
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    private SingleUserResponse mapUserToUserResponse(UserMessageDTO user) {

        return SingleUserResponse.newBuilder()
                .setUserId(user.getId() != null ? user.getId() : 0L)
                .setFirstName(user.getFirstName() != null ? user.getFirstName() : "")
                .setLastName(user.getLastName() != null ? user.getLastName() : "")
                .setFieldOfStudy(user.getFieldOfStudy() != null ? user.getFieldOfStudy() : "")
                .setUniversity(user.getUniversity() != null ? user.getUniversity() : "")
                .build();
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

