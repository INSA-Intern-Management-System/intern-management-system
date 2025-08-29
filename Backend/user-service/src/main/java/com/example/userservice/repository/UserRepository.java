package com.example.userservice.repository;


import com.example.userservice.model.Role;
import com.example.userservice.model.User;
import com.example.userservice.model.UserStatus;
import com.example.userservice.model.UserStatusCount;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);

    Page<User> findByRole(Role role, Pageable pageable);

    Long countByRole(Role role);
    List<User> findByFirstNameContainingIgnoreCaseAndRole_Name(String firstName, String roleName);
    List<User> findAll();

    Page<User> findByFirstNameContainingIgnoreCase(String firstName, Pageable pageable);


    Page<User> findByRoleAndFirstNameContainingIgnoreCaseOrRoleAndFieldOfStudyContainingIgnoreCase(
            Role role1, String firstName, Role role2, String fieldOfStudy, Pageable pageable
    );

   Page<User> findByRoleAndInstitution( Role role ,String institution, Pageable pageable);

   Page<User> findByRoleAndUserStatus(Role role, UserStatus userStatus, Pageable pageable);

   Page<User> findByRoleAndFieldOfStudyContainingIgnoreCase(Role role, String fieldOfStudy, Pageable pageable);


    Page<User> findByUserStatus(UserStatus userStatus, Pageable pageable);


    @Query("SELECT u.userStatus AS userStatus, COUNT(u) AS count FROM User u GROUP BY u.userStatus")
    List<UserStatusCount> countUsersByStatus();

    Page<User> findByRoleAndSupervisor_FirstNameContainingIgnoreCase(
            Role role1, String firstName, Pageable pageable
    );

    //count the number of user based on user status 
    int countByRoleIdAndUserStatus(Long role_id, UserStatus userStatus);

    //get list of user based on list on user id
    List<User> findByIdIn(List<Long> ids);


}


