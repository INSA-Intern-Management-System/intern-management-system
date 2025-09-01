package com.example.userservice.security;

import io.grpc.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class JwtServerInterceptor implements ServerInterceptor {

    @Autowired
    private Security security;

    private static final Context.Key<Long> USER_ID_CTX_KEY = Context.key("userId");
    private static final Context.Key<String> ROLE_CTX_KEY = Context.key("role");

    // Key for cookie header
    private static final Metadata.Key<String> COOKIE_HEADER_KEY =
            Metadata.Key.of("cookie", Metadata.ASCII_STRING_MARSHALLER);

    @Override
    public <ReqT, RespT> ServerCall.Listener<ReqT> interceptCall(
            ServerCall<ReqT, RespT> call,
            Metadata headers,
            ServerCallHandler<ReqT, RespT> next) {

        // Get the cookie header
        String cookieHeader = headers.get(COOKIE_HEADER_KEY);
        System.out.println("[GrpcAuth] Cookie header: " + cookieHeader);

        if (cookieHeader == null) {
            call.close(Status.UNAUTHENTICATED.withDescription("Missing cookie header"), new Metadata());
            return new ServerCall.Listener<>() {};
        }

        // Extract the access_token from cookies
        String token = extractTokenFromCookies(cookieHeader);
        System.out.println("[GrpcAuth] Extracted token: " + (token != null ? "found" : "not found"));

        if (token == null) {
            call.close(Status.UNAUTHENTICATED.withDescription("Missing access_token in cookies"), new Metadata());
            return new ServerCall.Listener<>() {};
        }

        try {
            if (!security.isTokenValid(token)) {
                throw new IllegalArgumentException("Invalid or expired token");
            }

            Long userId = security.extractUserId(token);
            String role = security.extractUserRole(token);

            System.out.println("[GrpcAuth] User connected: id=" + userId + ", role=" + role);

            Context ctx = Context.current()
                    .withValue(USER_ID_CTX_KEY, userId)
                    .withValue(ROLE_CTX_KEY, role);

            return Contexts.interceptCall(ctx, call, headers, next);

        } catch (Exception e) {
            System.err.println("[GrpcAuth] Token processing failed: " + e.getMessage());
            e.printStackTrace();
            call.close(Status.UNAUTHENTICATED.withDescription("Token processing failed: " + e.getMessage()), new Metadata());
            return new ServerCall.Listener<>() {};
        }
    }

    private String extractTokenFromCookies(String cookieHeader) {
        if (cookieHeader == null) {
            return null;
        }
        
        String[] cookies = cookieHeader.split(";");
        for (String cookie : cookies) {
            String[] parts = cookie.trim().split("=");
            if (parts.length == 2 && "access_token".equals(parts[0].trim())) {
                return parts[1].trim();
            }
        }
        return null;
    }

    public static Long getUserId() {
        return USER_ID_CTX_KEY.get();
    }

    public static String getRole() {
        return ROLE_CTX_KEY.get();
    }
}