package com.example.userservice.repository;


import com.example.userservice.model.User;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);
     //search for users by their first name with specified role
    List<User> findByFirstNameContainingIgnoreCaseAndRole(String firstName, String role);
}


