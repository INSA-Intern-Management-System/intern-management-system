package com.example.userservice.service;

import com.example.userservice.dto.LoginRequest;
import com.example.userservice.dto.RegisterRequest;
import com.example.userservice.model.User;
import com.example.userservice.repository.UserRepository;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.userservice.security.SecurityConfig.*;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepo;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepo, BCryptPasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public User registerUser(RegisterRequest request) {
        if (userRepo.findByEmail(request.email) != null) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setFirstName(request.firstName);
        user.setLastName(request.lastName);
        user.setEmail(request.email);

        String hashedPassword = passwordEncoder.encode(request.password);

        user.setPassword(hashedPassword);
        user.setPhoneNumber(request.phoneNumber);
        user.setAddress(request.address);
        user.setGender(request.gender);
        user.setFieldOfStudy(request.fieldOfStudy);
        user.setInstitution(request.institution);
        user.setRole(request.role);
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
        return savedUser;
    }

    @Override
    public User loginUser(LoginRequest request) {
        User user = userRepo.findByEmail(request.email);
        if (user == null || !passwordEncoder.matches(request.password, user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }
        return user;
    }

    @Override
    public List<User> getAllUsers(){
        return userRepo.findAll();
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








}
