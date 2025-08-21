package com.example.report_service.gRPC;
import com.example.report_service.service.ReportService;
import com.example.report_service.dto.ReportStatsDTO;
import com.example.report_service.security.JwtServerInterceptor;

import io.grpc.stub.StreamObserver;

public class ReportGrpcService extends ReportServiceGrpc.ReportServiceImplBase {

    private final ReportService service;

    public ReportGrpcService(ReportService service) {
        this.service = service;
        System.out.println("✅ Report Service grpc is created!");
    }

    @Override
    public void getReportStats(ReportStatsRequest request, StreamObserver<ReportStatsResponse> responseObserver) {
        Long userIdFromContext = JwtServerInterceptor.getUserId();
        Long userIdToUse = (userIdFromContext != null) ? userIdFromContext : request.getUserId();

        ReportStatsDTO result = service.getUserReportStats(userIdToUse);

        if (result== null) {
            responseObserver.onError(new RuntimeException("stats info not found"));
            return;
        }
        ReportStatsResponse response = ReportStatsResponse.newBuilder()
                .setTotalReports(result.getTotalReports())
                .setAverageRating(result.getAverageRating())
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

