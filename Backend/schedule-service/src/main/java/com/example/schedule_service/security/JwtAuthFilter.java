package com.example.schedule_service.security;

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
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired
    private Security security; // your JWT util class

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String token = null;

        // ✅ Get JWT from cookie
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("access_token".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        if (token != null) {
            try {
                // ✅ Validate token
                if (!security.isTokenValid(token)) {
                    throw new RuntimeException("Invalid or expired token");
                }

            // ✅ Extract user info
            Long userId = security.extractUserId(token);
            String role = security.extractUserRole(token);
            String email = security.extractEmail(token);
            String institution = security.extractUserInstitution(token);

            request.setAttribute("userId", userId);
            request.setAttribute("role", role);
            request.setAttribute("email", email);
            request.setAttribute("institution",institution);

            // ✅ Set authentication into SecurityContext
            List<SimpleGrantedAuthority> authorities =
                    List.of(new SimpleGrantedAuthority("ROLE_" + role));
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userId, null, authorities);
            SecurityContextHolder.getContext().setAuthentication(authentication);

            System.out.println("Authentication set for userId: " + userId);

        } catch (Exception e) {
            System.out.println("JWT validation failed: " + e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Unauthorized: " + e.getMessage());
            return;
        }

        // ✅ Continue the filter chain
        filterChain.doFilter(request, response);
    }
    }

    /**
     * ✅ Skip filtering for public endpoints (login, register, etc.)
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();

        return path.startsWith("/api/auth/login")
                || path.startsWith("/api/auth/register")
                || path.startsWith("/api/universities/login")
                || path.startsWith("/api/universities/register")
                || path.startsWith("/api/auth/request-password-change-otp")
                || path.startsWith("/api/auth/confirm-password-change-otp");
    }
}
