package com.example.application_service.gRPC;

import java.util.HashMap;
import com.example.application_service.services.ApplicationService;

import io.grpc.stub.StreamObserver;

public class ApplicationGrpcService extends ApplicationServiceGrpc.ApplicationServiceImplBase {

    private final ApplicationService service;

    public ApplicationGrpcService(ApplicationService service) {
        this.service = service;
        System.out.println("✅ Report Service grpc is created!");
    }

    @Override
    public void getApplicationCount(ApplicationCountRequest request, StreamObserver<ApplicationCountResponse> responseObserver) {
        HashMap<String,Long> result = service.getStats();
        if (result== null) {
            responseObserver.onError(new RuntimeException("stats info not found"));
            return;
        }
        ApplicationCountResponse response = ApplicationCountResponse.newBuilder()
                .setCount(result.get("total"))
                .setPending(result.get("pending"))
                .setAccepted(result.get("accepted"))
                .setRejected(result.get("rejected"))
                .build();
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

}
