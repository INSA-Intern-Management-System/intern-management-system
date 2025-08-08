
package com.example.message_service.client;


import io.grpc.*;

public class JwtClientInterceptor implements ClientInterceptor {
    private final String jwtToken;

    public JwtClientInterceptor(String jwtToken) {
        this.jwtToken = jwtToken;
    }

    @Override
    public <ReqT, RespT> ClientCall<ReqT, RespT> interceptCall(
            MethodDescriptor<ReqT, RespT> method, CallOptions callOptions, Channel next) {

        return new ForwardingClientCall.SimpleForwardingClientCall<>(next.newCall(method, callOptions)) {
            @Override
            public void start(Listener<RespT> responseListener, Metadata headers) {
                // Add the Authorization header
                Metadata.Key<String> AUTHORIZATION_METADATA_KEY =
                        Metadata.Key.of("Authorization", Metadata.ASCII_STRING_MARSHALLER);
                headers.put(AUTHORIZATION_METADATA_KEY, "Bearer " + jwtToken);
                super.start(responseListener, headers);
            }
        };
    }
}


