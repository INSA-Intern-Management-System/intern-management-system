package com.example.userservice.service;

import com.example.userservice.dto.*;
import com.example.userservice.model.*;
import com.example.userservice.repository.*;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final SystemSettingRepository systemSettingRepository;
    private final VerificationCodeRepository verificationCodeRepo;
    private final BCryptPasswordEncoder passwordEncoder;
    private final InternManagerService internManagerService;
    private  final InternManagerReposInterface internManagerReposInterface;

    @Autowired // <--- Make sure this is present
    private JavaMailSender mailSender;

    public UserServiceImpl(UserRepository userRepo,
                           RoleRepository roleRepo,
                           SystemSettingRepository systemSettingRepository,
                           InternManagerService internManagerService,
                           InternManagerReposInterface internManagerReposInterface,
                           BCryptPasswordEncoder passwordEncoder,
                           VerificationCodeRepository verificationCodeRepo
                           ) {
        this.userRepo = userRepo;
        this.roleRepo = roleRepo;
        this.systemSettingRepository = systemSettingRepository;
        this.internManagerService = internManagerService;
        this.internManagerReposInterface = internManagerReposInterface;
        this.verificationCodeRepo = verificationCodeRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public User registerUser(RegisterRequest request) {
        if (userRepo.findByEmail(request.email) != null) {
            throw new RuntimeException("Email already registered");
        }

        Role userRole = roleRepo.findByName(request.role.getName().toUpperCase());
        if (userRole == null) {
            throw new RuntimeException("Invalid role provided: " + request.role);
        }

        User user = new User();

        user.setFirstName(request.firstName);
        user.setLastName(request.lastName);
        user.setEmail(request.email);

        SystemSetting systemSetting = systemSettingRepository.findTopByOrderByIdAsc()
                .orElseThrow(() -> new RuntimeException("System settings not found"));
        String temporaryPassword = generateRandomPassword(systemSetting.getMinimumPasswordLength());

        String hashedPassword = passwordEncoder.encode(temporaryPassword);

        user.setPassword(hashedPassword);
        user.setPhoneNumber(request.phoneNumber);
        user.setAddress(request.address);
        user.setGender(request.gender);
        user.setFieldOfStudy(request.fieldOfStudy);
        user.setInstitution(request.institution);
        user.setRole(userRole);
//        user.setUserStatus(request.userStatus);
        user.setBio(request.bio);
        user.setNotifyEmail(request.notifyEmail);
        user.setVisibility(request.visibility);
        user.setDuration(request.duration);
        user.setLinkedInUrl(request.linkedInUrl);
        user.setGithubUrl(request.githubUrl);
        user.setCvUrl(request.cvUrl);
        user.setProfilePicUrl(request.profilePicUrl);
        user.setLastReadNotificationAt(request.lastReadNotificationAt);
        user.setCreatedAt(new Date());
        user.setUpdatedAt(new Date());

        User savedUser = userRepo.save(user);

        // ✅ Send email after saving
        String subject = "Welcome to INSA Internship Management System - Your Account Details";
        String message = String.format("""
            Hello %s,

            Your account has been successfully created by the administrator.

            Here are your login details:

            Email: %s
            Temporary Password: %s

            Please log in to your account and change your password immediately for security reasons:
            https://intern-insa0.onrender.com/login

            If you have any questions or didn't request this account, please contact support.

            Thank you,
            INSA Internship Management Team
            """, savedUser.getFirstName(), savedUser.getEmail(), temporaryPassword);

        sendEmail(savedUser.getEmail(), subject, message);

        System.out.println("Generated Temporary Password for " + savedUser.getEmail() + ": " + temporaryPassword);

        return savedUser;
    }

    @Override
    public User loginUser(LoginRequest request) {
        SystemSetting setting = systemSettingRepository.findTopByOrderByIdAsc()
                .orElseThrow(() -> new RuntimeException("System settings not found"));

        User user = userRepo.findByEmail(request.getEmail());

        if (user == null) {
            throw new RuntimeException("User with this email not found!");
        }

        // Maintenance mode check
        if (setting.getMaintenanceMode() && !user.getRole().getName().contains("ADMIN")) {
            throw new RuntimeException("Our System is under maintenance. Please try again later.");
        }

        // Automatic unlock if lock duration passed (e.g., 30 minutes)
        if (user.getAccountLocked() && user.getAccountLockedAt() != null) {
            LocalDateTime unlockTime = user.getAccountLockedAt().plusMinutes(31); // 30 min lock duration
            if (LocalDateTime.now().isAfter(unlockTime)) {
                user.setAccountLocked(false);
                user.setFailedAttempts(0);
                user.setAccountLockedAt(null);
                userRepo.save(user);
            } else {
                throw new RuntimeException("Your account is locked. Try again after: "
                        + java.time.Duration.between(LocalDateTime.now(), unlockTime).toMinutes() + " minutes.");
            }
        }

        // Check password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            user.setFailedAttempts(user.getFailedAttempts() + 1);

            int maxAttempts = setting.getMaxLoginAttempts() != null ? setting.getMaxLoginAttempts() : 5;

            if (user.getFailedAttempts() >= maxAttempts) {
                user.setAccountLocked(true);
                user.setAccountLockedAt(LocalDateTime.now()); // start lock timer
            }

            userRepo.save(user);
            int attemptsLeft = Math.max(0, maxAttempts - user.getFailedAttempts());
            throw new RuntimeException("Invalid password. Attempts left: " + attemptsLeft);
        }

        // Successful login
        user.setFailedAttempts(0);
        user.setAccountLocked(false);
        user.setAccountLockedAt(null);
        userRepo.save(user);

        return user;
    }

    @Override
    public User findByEmail(String email){
        User user = userRepo.findByEmail(email);
        return user;
    }

    @Override
    public User updateUserPassword(Long userId, UpdatePasswordDTO dto) {
        if (!dto.getNewPassword().equals(dto.getConfirmNewPassword())) {
            throw new RuntimeException("New password and confirm password do not match");
        }

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(dto.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }



        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        return userRepo.save(user);

    }

    @Override
    public Long countInterns(){
        Role studentRole = roleRepo.findByName("STUDENT");

        return userRepo.countByRole(studentRole);
    }


    @Override
    public User adminResetUserPassword(String targetUserEmail, String newPassword){
        User targetUser = userRepo.findByEmail(targetUserEmail);

        if (targetUser == null) {
            throw new RuntimeException("User with email " + targetUserEmail + " not found.");
        }

        String encodedNewPassword = passwordEncoder.encode(newPassword);
        targetUser.setPassword(encodedNewPassword);

        userRepo.save(targetUser);

        return targetUser;
    }

    // --- OTP Generation and Sending ---
    @Override
    @Transactional
    public VerificationCode generateAndSendOtpForPasswordChange(String userEmail) {
        User user = userRepo.findByEmail(userEmail);
        if (user == null) {
            throw new RuntimeException("verifcation code has been sent.");
        }

        // ✅ Updated: Find and delete any existing active OTP for this user (no type needed now)
        verificationCodeRepo.findByUser(user)
                .ifPresent(verificationCodeRepo::delete);

        String otpValue = generateNumericOtp(6);
        String hashedOtp = passwordEncoder.encode(otpValue);

        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(5);

        // ✅ Constructor updated: removed CodeType parameter
        VerificationCode verificationCode = new VerificationCode(hashedOtp, user, expiryTime);
        verificationCode = verificationCodeRepo.save(verificationCode);

        sendEmail(user.getEmail(), "Password Verification Code",
                "Your password verification code is: " + otpValue +
                        "\nThis code is valid for 5 minutes. Do not share it with anyone." +
                        "\nIf you did not request this, you can ignore this email.");

        return verificationCode;
    }


    // --- OTP Verification and Password Setting ---
    @Override
    @Transactional
    public User verifyOtpAndSetNewPassword(String userEmail, String otpSubmitted, String newPassword) {
        User user = userRepo.findByEmail(userEmail);
        if (user == null) {
            throw new RuntimeException("User not found.");
        }

        // ✅ Updated: Find by user only, as there's no type
        Optional<VerificationCode> verificationCodeOpt =
                verificationCodeRepo.findByUser(user);

        if (verificationCodeOpt.isEmpty()) {
            throw new RuntimeException("Invalid or incorrect verification code, or no code was requested for this user.");
        }

        VerificationCode verificationCode = verificationCodeOpt.get();

        if (verificationCode.isExpired()) {
            verificationCodeRepo.delete(verificationCode);
            throw new RuntimeException("Verification code has expired. Please request a new one.");
        }
        if (verificationCode.isUsed()) {
            throw new RuntimeException("Verification code has already been used.");
        }

        // Compare submitted plain OTP with stored hashed OTP
        if (!passwordEncoder.matches(otpSubmitted, verificationCode.getCode())) {
            throw new RuntimeException("Invalid or incorrect verification code.");
        }

        // Apply password policy for the new password
        if (newPassword == null || newPassword.length() < 8) {
            throw new RuntimeException("New password must be at least 8 characters long.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setFirstLogin(false);
        User updatedUser = userRepo.save(user);

        verificationCode.setUsed(true);
        verificationCodeRepo.save(verificationCode);

        return updatedUser;
    }


    @Override
    public Page<User> getAllUsers(Pageable pageable){
        return userRepo.findAll(pageable);
    }

    @Override
    public Long countAllUsers(){
        return userRepo.count();
    }


    @Override
    public void deleteUser(Long id){
        Optional<User> user = userRepo.findById(id);
        if(user.isEmpty()){
            throw new RuntimeException("User not found");
        }
        userRepo.deleteById(id);
    }

    @Override
    public User getUserById(Long id) {
        return userRepo.findById(id).get();
    }

    @Override
    public Role getRoleByName(String roleName) {
        return roleRepo.findByName(roleName);
    }

    @Override
    public User updateUser(Long id, User updatedUser) {
        User existingUser = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // Only update fields if they're not null
        if (updatedUser.getFirstName() != null) {
            existingUser.setFirstName(updatedUser.getFirstName());
        }
        if (updatedUser.getLastName() != null) {
            existingUser.setLastName(updatedUser.getLastName());
        }
        if (updatedUser.getEmail() != null) {
            existingUser.setEmail(updatedUser.getEmail());
        }
        if (updatedUser.getPassword() != null) {
            existingUser.setPassword(updatedUser.getPassword());
        }
        if (updatedUser.getPhoneNumber() != null) {
            existingUser.setPhoneNumber(updatedUser.getPhoneNumber());
        }
        if (updatedUser.getAddress() != null) {
            existingUser.setAddress(updatedUser.getAddress());
        }
        if (updatedUser.getGender() != null) {
            existingUser.setGender(updatedUser.getGender());
        }
        if (updatedUser.getFieldOfStudy() != null) {
            existingUser.setFieldOfStudy(updatedUser.getFieldOfStudy());
        }
        if (updatedUser.getInstitution() != null) {
            existingUser.setInstitution(updatedUser.getInstitution());
        }
        if (updatedUser.getCreatedAt() != null) {
            existingUser.setCreatedAt(updatedUser.getCreatedAt());
        }
        if (updatedUser.getUpdatedAt() != null) {
            existingUser.setUpdatedAt(updatedUser.getUpdatedAt());
        }
        if (updatedUser.getRole() != null) {
            existingUser.setRole(updatedUser.getRole());
        }
        if (updatedUser.getLastLogin() != null) {
            existingUser.setLastLogin(updatedUser.getLastLogin());
        }

        return userRepo.save(existingUser);
    }


    @Override
    public User saveUser(User user) {
        return userRepo.save(user);
    }

    @Override
    public User loadUserByEmail(String email){
        return userRepo.findByEmail(email);
    }


    @Override
    public Page<User> getInterns(Role role, Pageable pageable){
        return userRepo.findByRole(role, pageable);
    }

    @Override
    public Page<User> getSupervisors(Role role, Pageable pageable){
        return userRepo.findByRole(role, pageable);
    }


    @Override
    public Page<User> searchInterns(String query, Pageable pageable) {
        Role internRole = roleRepo.findByName("STUDENT");

        return userRepo.findByRoleAndFirstNameContainingIgnoreCaseOrRoleAndFieldOfStudyContainingIgnoreCase(
                internRole, query, internRole, query, pageable
        );
    }

    @Override
    public Page<User> searchUsers(String query, Pageable pageable) {
        return userRepo.findByFirstNameContainingIgnoreCase(query, pageable);
    }

    @Override
    public Page<User> filterUserByRole(String query, Pageable pageable){
        Role matchedRole = roleRepo.findByName(query);

        return userRepo.findByRole(matchedRole, pageable);
    }

    @Override
    public Page<User> filterByInstitution(String institution, Pageable pageable) {
        Role internRole = roleRepo.findByName("STUDENT");
        return userRepo.findByRoleAndInstitution(internRole, institution, pageable);
    }

    @Override
    public Page<User> filterSupervisorByInstitution(String institution, Pageable pageable) {
        Role supervisorRole = roleRepo.findByName("SUPERVISOR");
        return userRepo.findByRoleAndInstitution(supervisorRole, institution, pageable);
    }

    @Override
    public Page<User> filterInternByStatus(String query, Pageable pageable) {
        Role internRole = roleRepo.findByName("STUDENT");

        UserStatus matchedStatus;
        try {
            matchedStatus = UserStatus.valueOf(query.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status value: " + query);
        }

        return userRepo.findByRoleAndUserStatus(internRole, matchedStatus, pageable);
    }

    @Override
    public Page<User> filterSupervisorByStatus(String query, Pageable pageable) {
        Role supervisorRole = roleRepo.findByName("SUPERVISOR");

        UserStatus matchedStatus;
        try {
            matchedStatus = UserStatus.valueOf(query.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status value: " + query);
        }

        return userRepo.findByRoleAndUserStatus(supervisorRole, matchedStatus, pageable);
    }

    @Override
    public Page<User> filterSupervisorByFieldOfStudy(String query, Pageable pageable) {
        Role supervisorRole = roleRepo.findByName("SUPERVISOR");

        return userRepo.findByRoleAndFieldOfStudyContainingIgnoreCase(supervisorRole, query, pageable);
    }

    @Override
    public Page<User> filterInternBySupervisor(String supervisorName, Pageable pageable) {
        Role internRole = roleRepo.findByName("STUDENT");
        return userRepo.findByRoleAndSupervisor_FirstNameContainingIgnoreCase(
                internRole, supervisorName, pageable
        );
    }


    @Override
    public Page<User> filterAllUsersByStatus(String query , Pageable pageable) {

        UserStatus matchedStatus;
        try {
            matchedStatus = UserStatus.valueOf(query.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status value: " + query);
        }
        return userRepo.findByUserStatus( matchedStatus, pageable);
    }


    @Override
    public List<UserStatusCount> countUsersByStatus() {
        return userRepo.countUsersByStatus();
    }

    @Override
    public long countActiveInterns() {
        Role studentRole = roleRepo.findByName("STUDENT");
        UserStatus activeStatus = UserStatus.valueOf("ACTIVE");
        return userRepo.countByRoleIdAndUserStatus(studentRole.getId(), activeStatus);
    }

    @Override
    public Map<String, Long> getUserRoleCounts() {
        List<User> users = userRepo.findAll();
        Map<String, Long> roleCounts = new HashMap<>();

        long studentCount = users.stream()
                .filter(user -> user.getRole().getName() != null && "STUDENT".equalsIgnoreCase(user.getRole().getName()))
                .count();

        long companyCount = users.stream()
                .filter(user -> {
                    if (user.getRole() == null) return false;
                    String role = user.getRole().getName();
                    return "HR".equalsIgnoreCase(role) || "PROJECT_MANAGER".equalsIgnoreCase(role);
                })
                .count();

        long universityCount = users.stream()
                .filter(user -> user.getRole().getName() != null && "UNIVERSITY".equalsIgnoreCase(user.getRole().getName()))
                .count();

        long adminCount = users.stream()
                .filter(user -> user.getRole().getName() != null && "ADMIN".equalsIgnoreCase(user.getRole().getName()))
                .count();

        long supervisorCount = users.stream()
                .filter(user -> user.getRole() != null && "SUPERVISOR".equalsIgnoreCase(user.getRole().getName()))
                .count();

        roleCounts.put("Student", studentCount);
        roleCounts.put("Company", companyCount);
        roleCounts.put("University", universityCount);
        roleCounts.put("Administrator", adminCount);
        roleCounts.put("Supervisor", supervisorCount);

        return roleCounts;
    }

    @Override
    public Role createRole(RolesDTO dto) {
        Role role = new Role();

        role.setName(dto.getName());
        role.setDisplayName(dto.getDisplayName());
        role.setDescription(dto.getDescription());

        // Save entity using repository
        return roleRepo.save(role);
    }

    @Override
    public void assignSupervisor(AssignSupervisorRequestDTO dto) {
        // 1️⃣ Fetch student and Supervisor
        User student = userRepo.findByEmail(dto.getStudentEmail());
        User supervisor = userRepo.findByEmail(dto.getSupervisorEmail());

        // 2️⃣ Validations
        if (student == null || !student.getRole().getName().equals("STUDENT")) {
            throw new RuntimeException("Student with this email not found or role mismatch");
        }
        if (student.getUserStatus() != UserStatus.ACTIVE) {
            throw new RuntimeException("Only ACTIVE students can be assigned a Supervisor");
        }
        if (supervisor == null || !supervisor.getRole().getName().equals("SUPERVISOR")) {
            throw new RuntimeException("Supervisor with this email not found or role mismatch");
        }

        // 3️⃣ Update student's supervisor directly
        student.setSupervisor(supervisor);

        // 4️⃣ Find existing InternManager or create new
        InternManager internManager = null;
        try {
            internManager = internManagerReposInterface.getInfo(student.getId());
        } catch (RuntimeException e) {
            // Not found → create new
            internManager = new InternManager();
            internManager.setUser(student);
        }

        internManager.setSupervisor(supervisor); // if your entity has `supervisor` field

        // 6️⃣ Save both
        userRepo.save(student);
        internManagerService.createInternManager(internManager);
    }

    @Override
    public void assignProjectManager(AssignProjectManagerRequestDTO dto) {

        // 1️⃣ Fetch student and Project Manager from DB. This is a crucial step to get managed entities.
        User student = userRepo.findByEmail(dto.getStudentEmail());
        User projectManager = userRepo.findByEmail(dto.getProjectManagerEmail());

        // 2️⃣ Perform all validations upfront to fail fast.
        if (student == null || !student.getRole().getName().equals("STUDENT")) {
            throw new RuntimeException("Student with this email not found or role mismatch");
        }
        if (student.getUserStatus() != UserStatus.ACTIVE) {
            throw new RuntimeException("Only ACTIVE students can be assigned a Project Manager");
        }
        if (projectManager == null || !projectManager.getRole().getName().equals("PROJECT_MANAGER")) {
            throw new RuntimeException("Project Manager with this email not found or role mismatch");
        }

        // 3️⃣ Update the student's Project Manager.
        student.setProjectManager(projectManager);

        InternManager internManager = internManagerReposInterface.getInfo(student.getId());

        if (internManager == null) {
            // If not found, create a new InternManager and link the managed student object.
            internManager = new InternManager();
            internManager.setUser(student);
        }

        // 5️⃣ Set the project manager on the intern manager record.
        internManager.setManager(projectManager);

        // 6️⃣ Save both entities. The save operations will correctly link the existing,
        // managed User objects.
        userRepo.save(student);
        internManagerService.createInternManager(internManager);
    }

    @Override
    public Page<User> searchSupervisors(String query, String institution, Pageable pageable) {
        Role supervisorRole = roleRepo.findByName("SUPERVISOR");
        return userRepo.findByRoleAndInstitutionAndFirstNameContainingIgnoreCaseOrRoleAndInstitutionAndFieldOfStudyContainingIgnoreCase(
                supervisorRole, institution, query,
                supervisorRole, institution, query,
                pageable
        );
    }



    // --- Helper Methods (no changes needed) ---
    private String generateRandomPassword(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    private String generateNumericOtp(int length) {
        Random random = new Random();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(random.nextInt(10));
        }
        return sb.toString();
    }

    private void sendEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("your_app_email@example.com");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            System.out.println("Email sent to " + to + " with subject: " + subject);
        } catch (Exception e) {
            System.err.println("Error sending email to " + to + ": " + e.getMessage());
            throw new RuntimeException("Failed to send verification email.", e);
        }

    }

}
