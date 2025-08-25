package com.example.userservice.service;

import com.example.userservice.dto.*;
import com.example.userservice.model.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


import java.util.List;
import java.util.Map;

public interface UserService {

    // Auth related methods
    User registerUser(RegisterRequest request);
    User loginUser(LoginRequest request);

    Role getRoleByName(String roleName);

    User updateUserPassword(Long userId, UpdatePasswordDTO dto);

    User adminResetUserPassword(String targetUserIdentifier, String newPassword);

    VerificationCode generateAndSendOtpForPasswordChange(String email);

    User verifyOtpAndSetNewPassword(String userEmail, String otpSubmitted, String newPassword);

    Long countInterns();
    Long countAllUsers();

    // User related methods
    Page<User> getAllUsers(Pageable pageable);
    void deleteUser(Long id);

    User  getUserById(Long id);
    User updateUser(Long id, User user);

    User saveUser(User user);

    User loadUserByEmail(String email);

    void assignSupervisor(AssignSupervisorRequestDTO dto);
    void assignProjectManager(AssignProjectManagerRequestDTO dto);


    Page<User> getInterns(Role role, Pageable pageable);
    Page<User> getSupervisors(Role role, Pageable pageable);


    Page<User> searchInterns(String query, Pageable pageable);

    Page<User> searchUsers(String query, Pageable pageable);
    Page<User> filterUserByRole(String query, Pageable pageable);

    Page<User> filterByInstitution(String institution, Pageable pageable);
    Page<User> filterSupervisorByInstitution(String institution, Pageable pageable);


    Page<User> filterInternByStatus(String query, Pageable pageable);
    Page<User> filterSupervisorByStatus(String query, Pageable pageable);
    Page<User> filterSupervisorByFieldOfStudy(String query, Pageable pageable);

    Page<User> filterAllUsersByStatus(String query, Pageable pageable);


    List<UserStatusCount> countUsersByStatus();
    Map<String, Long> getUserRoleCounts();

    Role createRole(RolesDTO dto);
    

    Page<User> searchSupervisors(String query, Pageable pageable);
    Page<User> filterInternBySupervisor(String supervisorName, Pageable pageable);

    //count user using status 
    int countByRoleAndUserStatus(String role, UserStatus userStatus);
    //get list of users based on lists of user id
    List<UserMessageDTO> getUsersByIds(List<Long> ids);


}
