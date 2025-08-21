package com.example.userservice.client;

import java.util.concurrent.TimeUnit;

import com.example.project_service.gRPC.ProjectStatsResponse;
import com.example.report_service.gRPC.ReportServiceGrpc;
import com.example.report_service.gRPC.ReportStatsRequest;
import com.example.report_service.gRPC.ReportStatsResponse;
import com.example.report_service.gRPC.TopInternsRequest;
import com.example.report_service.gRPC.TopInternsResponse;
import com.example.report_service.gRPC.TotalReportResponse;
import com.google.protobuf.Empty;

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

    public TotalReportResponse getReportStatsForPM(String jwtToken, Long userId) {
        JwtClientInterceptor authInterceptor = new JwtClientInterceptor(jwtToken);
        ReportServiceGrpc.ReportServiceBlockingStub stubWithAuth = blockingStub.withInterceptors(authInterceptor);

        ReportStatsRequest request = ReportStatsRequest.newBuilder()
                .setUserId(userId)
                .build();

        return stubWithAuth.getTotalReportsForPM(request);
    }
    public TotalReportResponse getReportStatsForHR(String jwtToken) {
        JwtClientInterceptor authInterceptor = new JwtClientInterceptor(jwtToken);
        ReportServiceGrpc.ReportServiceBlockingStub stubWithAuth = blockingStub.withInterceptors(authInterceptor);
        return stubWithAuth.getTotalReportsForHR(Empty.newBuilder().build());
    }

    public TopInternsResponse getTopInterns(String jwtToken ,int page, int size) {
        JwtClientInterceptor authInterceptor = new JwtClientInterceptor(jwtToken);
        ReportServiceGrpc.ReportServiceBlockingStub stubWithAuth = blockingStub.withInterceptors(authInterceptor);
        
        TopInternsRequest request = TopInternsRequest.newBuilder()
                .setPage(page)
                .setSize(size)
                .build();
        return stubWithAuth.getTopInterns(request);
    }


    public void shutdown() throws InterruptedException {
        channel.shutdown().awaitTermination(5, TimeUnit.SECONDS);
    }

}




