package com.example.report_service.gRPC;
import com.example.report_service.service.ReportService;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import com.example.report_service.dto.GenericStatsDTO;
import com.example.report_service.dto.ManagerReportStatsDTO;
import com.example.report_service.dto.ReportProgressDTO;
import com.example.report_service.dto.ReportStatsDTO;
import com.example.report_service.dto.ReviewStatsDTO;
import com.example.report_service.dto.UserUniversityStatsDTO;
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
    public void getUniversityReportstats(UserUniversityStatsRequest request, StreamObserver<ReportStatsResponse> responseObserver) {
        List<Long> userIds = request.getUserIdsList();

        System.out.println("userIds: " + userIds);

        ReportStatsDTO result = service.getUniversityStatsOfReport(userIds);

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

    @Override
    public void getUserUniversityStats(UserUniversityStatsRequest request,StreamObserver<UserUniversityStatsResponse> responseObserver) {

        List<Long> userIds = request.getUserIdsList();

        // Call your service method to get the combined stats
        List<UserUniversityStatsDTO> statsList = service.getUniversityStatsOfUsers(userIds);

        if (statsList == null || statsList.isEmpty()) {
            responseObserver.onError(new RuntimeException("No stats found for the given users"));
            return;
        }

        UserUniversityStatsResponse.Builder responseBuilder = UserUniversityStatsResponse.newBuilder();

        for (UserUniversityStatsDTO dto : statsList) {
            UserUniversityStats.Builder statBuilder = UserUniversityStats.newBuilder()
                    .setUserId(dto.getUserId())
                    .setAverageRating(dto.getAverageRating())
                    .setTotalReports(dto.getTotalReports());

            if (dto.getLastReview() != null) {
                ReviewInfo.Builder reviewBuilder = ReviewInfo.newBuilder()
                        .setReviewId(dto.getLastReview().getId())
                        .setFeedback(dto.getLastReview().getFeedback())
                        .setRating(dto.getLastReview().getRating())
                        .setCreatedAt(dto.getLastReview().getCreatedAt().toString());
                statBuilder.setLastReview(reviewBuilder);
            }

            responseBuilder.addStats(statBuilder);
        }

        responseObserver.onNext(responseBuilder.build());
        responseObserver.onCompleted();
    }

    @Override
    public void getReportProgress(ReportProgressRequest request, StreamObserver<ReportProgressResponse> responseObserver) {
        try {

            List<ReportProgressDTO> result = service.getReportProgress(request.getUserIdList());
            if (result == null || result.isEmpty()) {
                responseObserver.onError(new RuntimeException("No reports found"));
                return;
            }
            // Build gRPC response
            ReportProgressResponse.Builder responseBuilder = ReportProgressResponse.newBuilder();
            for (ReportProgressDTO dto : result) {
                SingleProgress progress = SingleProgress.newBuilder()
                        .setUserId(dto.getInternId())               // Long → int64
                        .setProgress(dto.getAverageRating())
                        .setTotalReports(dto.getTotalReports())
                        .build();
                responseBuilder.addProgress(progress);
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

