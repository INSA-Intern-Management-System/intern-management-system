package com.example.userservice.controller;


import com.example.userservice.dto.*;
import com.example.userservice.model.Role;
import com.example.userservice.model.User;
import com.example.userservice.security.JwtUtil;
import com.example.userservice.service.UserService;
import com.google.common.net.HttpHeaders;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final  JwtUtil jwtUtil;

    public AuthController(UserService userService, JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request,
            HttpServletRequest httpServletRequest) {
        try {
            // Try to get role from token (set as request attribute by your security filter)
            String roleFromToken = (String) httpServletRequest.getAttribute("role");

            // Get role and internalSource from headers as fallback (for internal service calls)
            String roleFromHeader = httpServletRequest.getHeader("role");
            String internalSource = httpServletRequest.getHeader("internal-source");

            // Determine effective role to use for authorization
            String effectiveRole = roleFromToken != null ? roleFromToken : roleFromHeader;

            boolean allowed =
                    "ADMIN".equalsIgnoreCase(effectiveRole) ||
                            ("application-service".equalsIgnoreCase(internalSource) && "HR".equalsIgnoreCase(effectiveRole));

            if (!allowed) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Only ADMIN or HR from application-service can register users."));
            }

            User user = userService.registerUser(request);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "User registered successfully");
            response.put("user", new UserResponseDto(user));
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletResponse response) {
    try {
        User user = userService.loginUser(request);

        String token = jwtUtil.generateToken(user);
        boolean forcePasswordChange = user.isFirstLogin();

        // ✅ Create HttpOnly cookie
        ResponseCookie cookie = ResponseCookie.from("access_token", token)
                .httpOnly(true)
                .secure(false)           // local dev uses HTTP
                .path("/")
                .maxAge(24 * 60 * 60)
                .sameSite("Lax")         // allows cross-site requests for local dev
                .build();


        // ✅ Add cookie to response
        response.setHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        // ✅ Prepare body (optional — you can still return user info)
        AuthResponse authResponse = new AuthResponse(
                "User logged in successfully",
                forcePasswordChange,
                null, // no token in body anymore for security
                new UserResponseDto(user)
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(authResponse);

    } catch (RuntimeException e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}



    // --- New Public Endpoints for OTP-based Password Change ---

    @PostMapping("/request-password-change-otp") // ✅ Public: Request OTP
    public ResponseEntity<?> requestPasswordChangeOtp(@RequestBody OtpRequest otpRequest) {
        try {
            if (otpRequest.getEmail() == null || otpRequest.getEmail().isEmpty()) {
                return errorResponse("Email is required.");
            }
            userService.generateAndSendOtpForPasswordChange(otpRequest.getEmail());
            Map<String, String> response = new HashMap<>();
            response.put("message", "If an account with that email exists, a verification code has been sent, check your email quickly!");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // Be generic about error to avoid revealing user existence
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to send verification code. Please try again later.");
            System.err.println("Error requesting OTP: " + e.getMessage()); // Log actual error for debug
            return ResponseEntity.status(400).body(error);
        }
    }


    @PostMapping("/confirm-password-change-otp") // ✅ Public: Confirm OTP and Set New Password
    public ResponseEntity<?> confirmPasswordChangeOtp(@RequestBody PasswordResetOtpConfirmRequest confirmRequest) {
        try {
            if (confirmRequest.getEmail() == null || confirmRequest.getEmail().isEmpty() ||
                    confirmRequest.getOtp() == null || confirmRequest.getOtp().isEmpty() ||
                    confirmRequest.getNewPassword() == null || confirmRequest.getNewPassword().isEmpty()) {
                return errorResponse("Email, OTP, and new password are required.");
            }

            userService.verifyOtpAndSetNewPassword(
                    confirmRequest.getEmail(),
                    confirmRequest.getOtp(),
                    confirmRequest.getNewPassword()
            );

            Map<String, String> response = new HashMap<>();
            response.put("message", "Password has been successfully updated.");
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return errorResponse(e.getMessage());
        }
    }



    private ResponseEntity<?> errorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

}
