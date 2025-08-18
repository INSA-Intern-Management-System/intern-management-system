package com.example.message_service.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

    @Autowired
    private Security security; // your JWT utility

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
             // First try from header
            String token = accessor.getFirstNativeHeader("access-token");

            // If not found in header, try from cookies
            if ((token == null || token.isBlank()) && accessor.getSessionAttributes() != null) {
                String cookieHeader = (String) accessor.getHeader("cookie"); // all cookies in one string
                if (cookieHeader != null) {
                    for (String cookie : cookieHeader.split(";")) {
                        String[] parts = cookie.trim().split("=");
                        if (parts.length == 2 && "access_token".equals(parts[0])) {
                            token = parts[1];
                            break;
                        }
                    }
                }
            }

            if (token == null) {
                throw new IllegalArgumentException("Missing or invalid JWT token");
            }

            try {
                if (!security.isTokenValid(token)) {
                    throw new IllegalArgumentException("Invalid or expired token");
                }

                Long userId = security.extractUserId(token);
                String role = security.extractUserRole(token);

                // Save token and userId into session attributes for later retrieval
                if (accessor.getSessionAttributes() != null) {
                    accessor.getSessionAttributes().put("jwt", token);
                    accessor.getSessionAttributes().put("userId", userId);
                }

                List<SimpleGrantedAuthority> authorities =
                        List.of(new SimpleGrantedAuthority("ROLE_" + role));

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userId, null, authorities);

                accessor.setUser(authentication);
            } catch (Exception e) {
                // Log for debug
                System.err.println("[WebSocketAuth] Token processing failed: " + e.getMessage());
                e.printStackTrace();
                throw new IllegalArgumentException("Token processing failed: " + e.getMessage());
            }
        }

        return message;
    }

}
