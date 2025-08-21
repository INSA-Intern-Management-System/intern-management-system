package com.example.userservice.client;

import com.example.report_service.gRPC.ReportServiceGrpc;
import com.example.report_service.gRPC.ReportStatsRequest;
import com.example.report_service.gRPC.ReportStatsResponse;

import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;

public class ReportGrpcClient {

    private final ManagedChannel channel;
    private final ReportServiceGrpc.ReportServiceBlockingStub blockingStub;

    public ReportGrpcClient(String host, int port) {
        this.channel = ManagedChannelBuilder.forAddress(host, port)
                .usePlaintext()  // In production, replace with TLS
                .build();
        this.blockingStub = ReportServiceGrpc.newBlockingStub(channel);
    }

    public ReportStatsResponse getReportStatsForUser(String jwtToken, Long userId) {
        JwtClientInterceptor authInterceptor = new JwtClientInterceptor(jwtToken);
        ReportServiceGrpc.ReportServiceBlockingStub stubWithAuth = blockingStub.withInterceptors(authInterceptor);

        ReportStatsRequest request = ReportStatsRequest.newBuilder()
                .setUserId(userId)
                .build();

        return stubWithAuth.getReportStats(request);
    }
}




