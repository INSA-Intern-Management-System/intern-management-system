package com.example.userservice.repository;
import com.example.userservice.model.User;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserMessageJpa extends JpaRepository<User, Long> {

    List<User> findAllByIdIn(List<Long> ids);
    Page<User> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
            String firstNameKeyword, String lastNameKeyword, Pageable pageable);
    int countByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
            String firstNameKeyword, String lastNameKeyword);
}
