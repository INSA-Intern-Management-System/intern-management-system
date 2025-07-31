package com.example.userservice.repository;


import com.example.userservice.model.Role;
import com.example.userservice.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);
    Page<User> findByRole(Role role, Pageable pageable);

    Page<User> findByRoleAndFirstNameContainingIgnoreCaseOrRoleAndFieldOfStudyContainingIgnoreCase(
            Role role1, String firstName, Role role2, String fieldOfStudy, Pageable pageable
    );

   Page<User> findByRoleAndInstitutionContainingIgnoreCase( Role role ,String institution, Pageable pageable);



}


