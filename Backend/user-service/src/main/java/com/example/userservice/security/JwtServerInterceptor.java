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

    // Define the custom metadata key for the token, matching the client
    private static final Metadata.Key<String> COOKIE_TOKEN_KEY =
            Metadata.Key.of("access-token", Metadata.ASCII_STRING_MARSHALLER);

    @Override
    public <ReqT, RespT> ServerCall.Listener<ReqT> interceptCall(
            ServerCall<ReqT, RespT> call,
            Metadata headers,
            ServerCallHandler<ReqT, RespT> next) {

        // Get the token from the custom metadata key instead of "Authorization"
        String token = headers.get(COOKIE_TOKEN_KEY);
        System.out.println("[GrpcAuth] Token from custom header: " + token);

        if (token == null) {
            call.close(Status.UNAUTHENTICATED.withDescription("Missing token in custom cookie-access-token header"), new Metadata());
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

    public static Long getUserId() {
        return USER_ID_CTX_KEY.get();
    }

    public static String getRole() {
        return ROLE_CTX_KEY.get();
    }
}