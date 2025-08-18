package com.example.userservice.repository;

import com.example.userservice.model.SystemSetting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SystemSettingRepository extends JpaRepository<SystemSetting, Long> {
    Optional<SystemSetting> findTopByOrderByIdAsc();
}
