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
            String token = accessor.getFirstNativeHeader("access-token");
            if (token == null || !token.startsWith("Bearer ")) {
                throw new IllegalArgumentException("Missing or invalid access-token header");
            }

            token = token.substring(7);

            try {
                if (!security.isTokenValid(token)) {
                    throw new IllegalArgumentException("Invalid or expired token");
                }

                Long userId = security.extractUserId(token);
                String role = security.extractUserRole(token);

                System.out.println("[WebSocketAuth] User connected: id=" + userId + ", role=" + role);

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

