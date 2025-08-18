package com.example.userservice.gRPC;

import com.example.userservice.dto.UserMessageDTO;
import com.example.userservice.model.Role;
import com.example.userservice.model.Status;
import com.example.userservice.repository.UserMessageInterface;
import com.example.userservice.security.JwtServerInterceptor;

import io.grpc.stub.StreamObserver;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.stream.Collectors;

public class UserGrpcService extends UserServiceGrpc.UserServiceImplBase {

    private final UserMessageInterface repository;

    public UserGrpcService(UserMessageInterface repository) {
        this.repository = repository;
        System.out.println("✅ UserGrpcService created!");
    }

    @Override
    public void getUser(UserRequest request, StreamObserver<UserResponse> responseObserver) {
        try{
            Long userIdFromContext = JwtServerInterceptor.getUserId();
            if( userIdFromContext<=0){
                responseObserver.onError(new RuntimeException("Invalid user ID provided"));
            return;
            }
            Long userIdToUse = request.getUserId();
 
        if (userIdToUse <= 0) {
            responseObserver.onError(new RuntimeException("Invalid user ID provided"));
            return;
        }

        UserMessageDTO user = repository.getUser(request.getUserId());

        if (user == null) {
            responseObserver.onError(new RuntimeException("User not found with id: " + request.getUserId()));
            return;
        }

        //if status is null make it online 
        if(user.getStatus()==null){
            user.setStatus(Status.ONLINE);
        }
        
        
        UserResponse response = mapUserToUserResponse(user);
        responseObserver.onNext(response);
        responseObserver.onCompleted();
        } catch (Exception e) {
            //print message 
            System.out.println("error:" +e.getMessage());
        }


        
    }

    @Override
    public void getUsersByIds(UserIdsRequest request, StreamObserver<UsersResponse> responseObserver) {
        List<UserMessageDTO> users = repository.getUsersByIds(request.getUserIdsList());
        List<UserResponse> userResponses = users.stream()
                .map(this::mapUserToUserResponse)
                .collect(Collectors.toList());

        UsersResponse response = UsersResponse.newBuilder()
                .addAllUsers(userResponses)
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void searchByName(SearchByNameRequest request, StreamObserver<SearchByNameResponse> responseObserver) {
        String keyword = request.getKeyword();
        int page = request.getPage();
        int size = request.getSize();

        Pageable pageable = PageRequest.of(page, size);
        Page<UserMessageDTO> userPage = repository.searchByName(keyword, pageable);

        List<UserResponse> userResponses = userPage.getContent().stream()
                .map(this::mapUserToUserResponse)
                .collect(Collectors.toList());

        SearchByNameResponse response = SearchByNameResponse.newBuilder()
                .addAllUsers(userResponses)
                .setCurrentPage(userPage.getNumber())
                .setTotalPages(userPage.getTotalPages())
                .setTotalElements((int) userPage.getTotalElements())
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    // Helper method to map your User entity to UserResponse protobuf message
    private UserResponse mapUserToUserResponse(UserMessageDTO user) {
        Role roleEntity = user.getRole();

        RoleMessage roleMessage = RoleMessage.newBuilder()
                .setId(roleEntity != null && roleEntity.getId() != null ? roleEntity.getId() : 0L)
                .setName(roleEntity != null && roleEntity.getName() != null ? roleEntity.getName() : "")
                .setDisplayName(roleEntity != null && roleEntity.getDisplayName() != null ? roleEntity.getDisplayName() : "")
                .setDescription(roleEntity != null && roleEntity.getDescription() != null ? roleEntity.getDescription() : "")
                .build();

        return UserResponse.newBuilder()
                .setUserId(user.getId() != null ? user.getId() : 0L)
                .setFirstName(user.getFirstName() != null ? user.getFirstName() : "")
                .setLastName(user.getLastName() != null ? user.getLastName() : "")
                .setFieldOfStudy(user.getFieldOfStudy() != null ? user.getFieldOfStudy() : "")
                .setUniversity(user.getUniversity() != null ? user.getUniversity() : "")
                .setStatus(mapStatus(user.getStatus()))
                .setRole(roleMessage)
                .build();
    }

    // Helper to convert your Status enum to protobuf Status enum
    private com.example.userservice.gRPC.Status mapStatus(Status status) {
        if (status == null) {
            return com.example.userservice.gRPC.Status.UNKNOWN;
        }
        switch (status) {
            case ONLINE:
                return com.example.userservice.gRPC.Status.ONLINE;
            case OFFLINE:
                return com.example.userservice.gRPC.Status.OFFLINE;
            default:
                return com.example.userservice.gRPC.Status.UNKNOWN;
        }
    }
}
