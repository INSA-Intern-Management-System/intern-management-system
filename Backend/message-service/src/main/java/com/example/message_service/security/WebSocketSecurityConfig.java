package com.example.message_service.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.messaging.access.intercept.MessageMatcherDelegatingAuthorizationManager;
import org.springframework.messaging.Message;

@Configuration
public class WebSocketSecurityConfig {

    @Bean
    public AuthorizationManager<Message<?>> messageAuthorizationManager() {
        return MessageMatcherDelegatingAuthorizationManager.builder()
            .simpDestMatchers("/app/**").authenticated()
            .simpSubscribeDestMatchers("/topic/**").authenticated()
            .anyMessage().denyAll()
            .build();
    }
}
