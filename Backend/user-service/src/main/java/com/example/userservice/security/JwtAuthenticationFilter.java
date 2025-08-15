package com.example.userservice.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
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

        String internalHeader = request.getHeader("X-Internal-Call");
        if ("true".equalsIgnoreCase(internalHeader)) {
            filterChain.doFilter(request, response);
            return;
        }


        String token = null;

        // ✅ Read JWT from cookies
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("access_token".equals(cookie.getName())) {
                    token = cookie.getValue();
                }
            }
        }

        if (token != null) {
            try {
                if (!jwtUtil.isTokenValid(token)) {
                    throw new RuntimeException("Invalid or expired token");
                }

                Long userId = jwtUtil.extractUserId(token);
                String role = jwtUtil.extractUserRole(token);
                String email = jwtUtil.extractEmail(token);

                request.setAttribute("userId", userId);
                request.setAttribute("role", role);
                request.setAttribute("email", email);

                List<SimpleGrantedAuthority> authorities =
                        List.of(new SimpleGrantedAuthority("ROLE_" + role));
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userId, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(authentication);

            } catch (Exception e) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Unauthorized: " + e.getMessage());
                return;
            }
        } else {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Missing access_token cookie");
            return;
        }

        filterChain.doFilter(request, response);
    }

    // Skip filter for public endpoints
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getServletPath();
        return path.equals("/api/auth/login") ||
                path.equals("/api/auth/request-password-change-otp") ||
                path.equals("/api/users") ||
                path.equals("/api/users/\\d+") ||
                path.equals("/api/users/filter-by-role") ||
                path.equals("/api/users/interns/search") ||
                path.equals("/api/users/supervisors/search")||
                path.equals("/api/users/supervisors") ||
                path.equals("/api/users/interns") ||
                path.equals("/api/users/filter-all-users-by-status") ||
                path.equals("/api/users/filter-interns-by-status") ||
                path.equals("/api/users/filter-supervisor-by-status") ||
                path.equals("/api/users/filter-supervisor-by-field-of-study") ||
                path.equals("/api/users/filter-interns-by-university") ||
                path.equals("/api/users/filter-intern-by-supervisor") ||
                path.equals("/api/users/status-count") ||
                path.equals("/api/users/role-counts") ||
                path.equals("/api/auth/confirm-password-change-otp") ||
                path.equals("/actuator/health");

    }
}


