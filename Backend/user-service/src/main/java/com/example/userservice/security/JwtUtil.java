package com.example.userservice.security;

import com.example.userservice.model.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.function.Function;


@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    private Key key;

    @PostConstruct
    public void init() {
        // The secret must be at least 32 bytes
        if (secret.length() < 32) {
            throw new IllegalArgumentException("JWT secret must be at least 32 characters long.");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    // Generate token using UserDetails
    public String generateToken(User user) {
        return Jwts.builder()
                .setSubject(user.getEmail())
//                .claim("lastLogin", lastLogin.getTime())
                .claim("userId", user.getId())  // use getter
                .claim("email", user.getEmail())
                .claim("role", user.getRole()) // assuming enum or String
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // 10 hrs
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // Extract username/email from token
    public Long extractUserId(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("userId", Long.class);
    }

    public String extractRole(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("role", String.class);
    }

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject); // or get("email", String.class);
    }
    // Check if token is valid

    public boolean isTokenExpired(String token) {
        final Date expiration = extractExpiration(token);
        return expiration.before(new Date());
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String email = extractEmail(token);

        if (!email.equals(userDetails.getUsername()) || isTokenExpired(token)) {
            throw new RuntimeException("Invalid Token");
        }

        Claims claims = extractAllClaims(token);
        long tokenLastLoginMillis = claims.get("lastLogin", Long.class);

        if (userDetails instanceof com.example.userservice.model.User user) {
            Date currentLastLogin = user.getLastLogin();
            if (currentLastLogin == null || currentLastLogin.getTime() != tokenLastLoginMillis) {
                throw new RuntimeException("Invalid Token");
            }
            return true;
        }

        throw new RuntimeException("Invalid Token");
    }


    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
