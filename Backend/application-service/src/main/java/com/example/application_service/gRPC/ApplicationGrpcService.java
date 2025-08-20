package com.example.application_service.gRPC;

import com.example.application_service.repository.ApplicationRepository;
import com.example.applicationservice.grpc.ApplicationCountRequest;
import com.example.applicationservice.grpc.ApplicationCountResponse;
import com.example.applicationservice.grpc.ApplicationServiceGrpc;
import io.grpc.stub.StreamObserver;
import org.springframework.beans.factory.annotation.Autowired;


public class ApplicationGrpcService extends ApplicationServiceGrpc.ApplicationServiceImplBase {

    @Autowired
    private ApplicationRepository applicationRepository;

    public ApplicationGrpcService(ApplicationRepository applicationRepository){
        this.applicationRepository = applicationRepository;
    }

    @Override
    public void getApplicationCount(ApplicationCountRequest request,
                                    StreamObserver<ApplicationCountResponse> responseObserver) {
        try {
            long count = applicationRepository.count();

            ApplicationCountResponse response = ApplicationCountResponse.newBuilder()
                    .setCount((int) count)
                    .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();

        } catch (Exception e) {
            responseObserver.onError(e);
        }
    }
}
