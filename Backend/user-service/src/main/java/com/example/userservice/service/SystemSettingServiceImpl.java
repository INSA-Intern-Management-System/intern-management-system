package com.example.userservice.service;

import com.example.userservice.model.SystemSetting;
import com.example.userservice.repository.SystemSettingRepository;
import org.springframework.stereotype.Service;


@Service
public class SystemSettingServiceImpl implements SystemSettingService{

    private final SystemSettingRepository systemSettingRepo;

    public SystemSettingServiceImpl(SystemSettingRepository systemSettingRepo){
        this.systemSettingRepo = systemSettingRepo;
    }

    @Override
    public SystemSetting registerSystem(SystemSetting request) {
        SystemSetting systemSetting = new SystemSetting();

        // General
        systemSetting.setSystemName(request.getSystemName());
        systemSetting.setAdminEmail(request.getAdminEmail());
        systemSetting.setSupportEmail(request.getSupportEmail());
        systemSetting.setSystemUrl(request.getSystemUrl());
        systemSetting.setTimeZone(
                request.getTimeZone() != null ? request.getTimeZone() : "Europe/Paris"
        );
        systemSetting.setDefaultLanguage(
                request.getDefaultLanguage() != null ? request.getDefaultLanguage() : "English"
        );
        systemSetting.setMaintenanceMode(
                request.getMaintenanceMode() != null ? request.getMaintenanceMode() : false
        );

        // Notifications
        systemSetting.setEmailNotificationEnabled(
                request.getEmailNotificationEnabled() != null ? request.getEmailNotificationEnabled() : true
        );

        // Security Settings
        systemSetting.setMinimumPasswordLength(
                request.getMinimumPasswordLength() != null ? request.getMinimumPasswordLength() : 8
        );
        systemSetting.setRequireSpecialCharacters(
                request.getRequireSpecialCharacters() != null ? request.getRequireSpecialCharacters() : true
        );
        systemSetting.setSessionTimeoutMinutes(
                request.getSessionTimeoutMinutes() != null ? request.getSessionTimeoutMinutes() : 30
        );
        systemSetting.setMaxLoginAttempts(
                request.getMaxLoginAttempts() != null ? request.getMaxLoginAttempts() : 5
        );
        systemSetting.setIpWhitelist(request.getIpWhitelist());

        systemSetting.setMaxInterns(request.getMaxInterns());
        systemSetting.setInternshipDuration(request.getInternshipDuration());
        systemSetting.setReportFrequency(request.getReportFrequency());
        systemSetting.setEvaluationDeadline(request.getEvaluationDeadline());

        return systemSettingRepo.save(systemSetting);
    }

    @Override
    public SystemSetting getSystemSetting() {
        return systemSettingRepo.findTopByOrderByIdAsc()
                .orElseThrow(() -> new RuntimeException("System settings not found"));
    }

    @Override
    public SystemSetting updateSystemSetting(SystemSetting newSystemSetting) {
        // Fetch the existing system setting (assuming there's only one entry)
        SystemSetting existingSetting = systemSettingRepo.findTopByOrderByIdAsc()
                .orElseThrow(() -> new RuntimeException("System settings not found"));

        // Update fields from input
        existingSetting.setSystemName(newSystemSetting.getSystemName());
        existingSetting.setAdminEmail(newSystemSetting.getAdminEmail());
        existingSetting.setSupportEmail(newSystemSetting.getSupportEmail());
        existingSetting.setSystemUrl(newSystemSetting.getSystemUrl());
        existingSetting.setTimeZone(newSystemSetting.getTimeZone());
        existingSetting.setDefaultLanguage(newSystemSetting.getDefaultLanguage());
        existingSetting.setMaintenanceMode(newSystemSetting.getMaintenanceMode());

        // Notification settings
        existingSetting.setEmailNotificationEnabled(newSystemSetting.getEmailNotificationEnabled());

        // Security settings
        existingSetting.setMinimumPasswordLength(newSystemSetting.getMinimumPasswordLength());
        existingSetting.setRequireSpecialCharacters(newSystemSetting.getRequireSpecialCharacters());
        existingSetting.setSessionTimeoutMinutes(newSystemSetting.getSessionTimeoutMinutes());
        existingSetting.setMaxLoginAttempts(newSystemSetting.getMaxLoginAttempts());
        existingSetting.setIpWhitelist(newSystemSetting.getIpWhitelist());

        // internship

        existingSetting.setMaxInterns(newSystemSetting.getMaxInterns());
        existingSetting.setInternshipDuration(newSystemSetting.getInternshipDuration());
        existingSetting.setReportFrequency(newSystemSetting.getReportFrequency());
        existingSetting.setEvaluationDeadline(newSystemSetting.getEvaluationDeadline());

        // Save and return the updated entity
        return systemSettingRepo.save(existingSetting);
    }

}
