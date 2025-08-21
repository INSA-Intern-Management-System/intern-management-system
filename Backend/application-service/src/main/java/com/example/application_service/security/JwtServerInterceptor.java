package com.example.application_service.security;

import io.grpc.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class JwtServerInterceptor implements ServerInterceptor {

    @Autowired
    private Security security; // your JWT utility

    private static final Context.Key<Long> USER_ID_CTX_KEY = Context.key("userId");
    private static final Context.Key<String> ROLE_CTX_KEY = Context.key("role");

    @Override
    public <ReqT, RespT> ServerCall.Listener<ReqT> interceptCall(
            ServerCall<ReqT, RespT> call, 
            Metadata headers,
            ServerCallHandler<ReqT, RespT> next) {

        String token = null;
        Metadata.Key<String> authKey = Metadata.Key.of("Authorization", Metadata.ASCII_STRING_MARSHALLER);
        String rawHeader = headers.get(authKey);
        System.out.println("[GrpcAuth] Raw header: " + rawHeader);
        token=rawHeader;

        if (token == null) {
            call.close(Status.UNAUTHENTICATED.withDescription("Missing or invalid authorization header"), new Metadata());
            return new ServerCall.Listener<>() {}; 
        }

        try {
            if (!security.isTokenValid(token)) {
                throw new IllegalArgumentException("Invalid or expired token");
            }

            Long userId = security.extractUserId(token);
            String role = security.extractUserRole(token);

            System.out.println("[GrpcAuth] User connected: id=" + userId + ", role=" + role);

            // Put into gRPC context 
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

    // Accessors if you want to read in service:
    public static Long getUserId() {
        return USER_ID_CTX_KEY.get();
    }

    public static String getRole() {
        return ROLE_CTX_KEY.get();
    }
}


