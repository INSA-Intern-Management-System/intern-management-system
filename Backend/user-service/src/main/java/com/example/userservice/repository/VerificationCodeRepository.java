package com.example.userservice.repository;

import com.example.userservice.model.VerificationCode;
import com.example.userservice.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface VerificationCodeRepository extends JpaRepository<VerificationCode, Long> {
    // ✅ Updated: Removed 'type' parameter from findByCodeAndTypeAndUser
    Optional<VerificationCode> findByCodeAndUser(String code, User user);

    // ✅ Updated: Removed 'type' parameter from findByUserAndType
    Optional<VerificationCode> findByUser(User user); // For finding existing active code
}