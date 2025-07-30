package com.example.userservice.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            System.out.println("JWT Token: " + token);
            try {
                // validate token
                if (!jwtUtil.isTokenValid(token)) {
                    System.out.println("Invalid or expired token");
                    throw new RuntimeException("Invalid or expired token");
                }

                System.out.println("Valid token, proceeding with request");

                // extract user info
                Long userId = jwtUtil.extractUserId(token);
                String role = jwtUtil.extractUserRole(token);
                String email = jwtUtil.extractEmail(token);

                // put into request attributes
                request.setAttribute("userId", userId);
                request.setAttribute("role", role);
                request.setAttribute("email", email);
                System.out.println("User ID: " + userId + ", Role: " + role + ", Email: " + email);

                // ✅ set Authentication into SecurityContext
                List<SimpleGrantedAuthority> authorities =
                        List.of(new SimpleGrantedAuthority("ROLE_" + role)); // e.g., ROLE_Student
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userId, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(authentication);
                System.out.println("Authentication set in security context for userId: " + userId);

            } catch (Exception e) {
                System.out.println("JWT validation failed: " + e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Unauthorized: " + e.getMessage());
                return;
            }
        } else {
            // missing header → reject
            System.out.println("Missing Authorization header");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Missing Authorization header");
            return;
        }

        System.out.println("JWT filter passed, continuing request");
        // continue with the filter chain
        filterChain.doFilter(request, response);
    }

    // Skip filter for public endpoints
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getServletPath();
        return path.equals("/api/auth/login") ||
                path.equals("/api/auth/request-password-change-otp") ||
                path.equals("/api/auth/confirm-password-change-otp");
    }
}


