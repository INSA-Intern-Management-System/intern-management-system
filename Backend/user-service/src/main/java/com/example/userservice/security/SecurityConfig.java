package com.example.userservice.security;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/internal/**").permitAll() // if you allow internal unauthenticated
                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/register",
                                "/api/universities/login",
                                "/api/universities/register",
                                "/api/users",
                                "/api/users/filter-interns-by-university",
                                "/api/users/filter-all-users-by-status",
                                "/api/users/filter-supervisor-by-status",
                                "/api/users/filter-supervisor-by-field-of-study",
                                "/api/users/filter-interns-by-status",
                                "/api/users/interns/search",
                                "/api/users/status-count",
                                "/api/users/role-counts",
                                "/api/users/filter-by-role",
                                "/api/users/filter-by-institution",
                                "/api/auth/request-password-change-otp",
                                "/api/auth/confirm-password-change-otp"
                        ).permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

//    @Bean
//    public JwtAuthenticationFilter jwtAuthenticationFilter(JwtUtil jwtUtil, UserService userService) {
//        return new JwtAuthenticationFilter(jwtUtil, userService);
//    }
}
