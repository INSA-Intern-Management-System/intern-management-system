package com.example.report_service.gRPC;
import com.example.report_service.service.ReportService;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import com.example.report_service.dto.GenericStatsDTO;
import com.example.report_service.dto.ManagerReportStatsDTO;
import com.example.report_service.dto.ReportStatsDTO;
import com.example.report_service.dto.ReviewStatsDTO;
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

    @Override
    public void getTotalReportsForHR(com.google.protobuf.Empty request, 
                                    StreamObserver<TotalReportResponse> responseObserver) {
        // Call service method to get total report stats for PM
        GenericStatsDTO result = service.getGlobalReportStats();

        if (result == null) {
            responseObserver.onError(new RuntimeException("total reports info not found"));
            return;
        }

        TotalReportResponse response = TotalReportResponse.newBuilder()
                .setTotalPendingReports(result.getPendingReports())
                .setTotalResolvedReports(result.getGivenReports())
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void getTotalReportsForPM(ReportStatsRequest request, 
                                    StreamObserver<TotalReportResponse> responseObserver) {
        Long userIdFromContext = JwtServerInterceptor.getUserId();
        Long userIdToUse = (userIdFromContext != null) ? userIdFromContext : request.getUserId();

        // Call service method to get total report stats for PM
        ManagerReportStatsDTO result = service.getManagerReportStats(userIdToUse);

        if (result == null) {
            responseObserver.onError(new RuntimeException("total reports info not found"));
            return;
        }

        TotalReportResponse response = TotalReportResponse.newBuilder()
                .setTotalPendingReports(result.getPendingReports())
                .setTotalResolvedReports(result.getReviewedReports())
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void getTopInterns(TopInternsRequest request, StreamObserver<TopInternsResponse> responseObserver) {
        try {
            // pagination from request
            int page = (int) request.getPage();
            int size = (int) request.getSize();

            // Call service method to get top interns
            Pageable pageable = PageRequest.of(page, size);
            List<ReviewStatsDTO> result = service.getTopInterns(pageable);

            if (result == null || result.isEmpty()) {
                responseObserver.onError(new RuntimeException("No interns found"));
                return;
            }

            // Build gRPC response
            TopInternsResponse.Builder responseBuilder = TopInternsResponse.newBuilder();

            for (ReviewStatsDTO dto : result) {
                TopInterns intern = TopInterns.newBuilder()
                        .setUserId(dto.getUserID())               // Long → int64
                        .setRating(dto.getAverageRating())          // Double → double
                        .build();

                responseBuilder.addInterns(intern);
            }

            responseObserver.onNext(responseBuilder.build());
            responseObserver.onCompleted();

        } catch (Exception e) {
            responseObserver.onError(e);
        }
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

