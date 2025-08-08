//package com.example.userservice.service;
//
//import com.example.userservice.model.User;
//import com.example.userservice.repository.UserRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.core.userdetails.*;
//import org.springframework.stereotype.Service;
//
//@Service
//public class CustomUserDetailsService implements UserDetailsService {
//
//    @Autowired
//    private UserRepository userRepo;
//
//    @Override
//    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
//        User user = userRepo.findByEmail(email);
//        if (user == null) {
//            throw new UsernameNotFoundException("User not found with email: " + email);
//        }
//        return user;
//    }
//}
