package com.example.userservice.service;

import com.example.userservice.dto.LoginRequest;
import com.example.userservice.dto.RegisterRequest;
import com.example.userservice.model.Role;
import com.example.userservice.model.User;
import com.example.userservice.model.VerificationCode;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


import java.util.List;

public interface UserService {

    // Auth related methods
    User registerUser(RegisterRequest request);
    User loginUser(LoginRequest request);

    User adminResetUserPassword(String targetUserIdentifier, String newPassword);

    VerificationCode generateAndSendOtpForPasswordChange(String email);

    User verifyOtpAndSetNewPassword(String userEmail, String otpSubmitted, String newPassword);

    // User related methods
    List<User> getAllUsers();
    void deleteUser(Long id);

    User  getUserById(Long id);
    User updateUser(Long id, User user);

    User saveUser(User user);

    User loadUserByEmail(String email);

    Page<User> getInterns(Role role, Pageable pageable);
    Page<User> getSupervisors(Role role, Pageable pageable);

    Page<User> searchInterns(String query, Pageable pageable);

    Page<User> filterByInstitution(String institution, Pageable pageable);


}
