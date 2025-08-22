package com.example.userservice.service;

import com.example.grpc.NotificationType;
import com.example.grpc.RecipientRole;
import com.example.userservice.client.NotificationGrpcClient;
import com.example.userservice.model.SystemSetting;
import com.example.userservice.repository.SystemSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Set;


@Service
public class SystemSettingServiceImpl implements SystemSettingService{

    @Autowired
    private NotificationGrpcClient notificationGrpcClient;


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
        // Fetch the existing system setting
        SystemSetting existingSetting = systemSettingRepo.findTopByOrderByIdAsc()
                .orElseThrow(() -> new RuntimeException("System settings not found"));

        boolean maintenanceModeBefore = Boolean.TRUE.equals(existingSetting.getMaintenanceMode());
        boolean maintenanceModeAfter = Boolean.TRUE.equals(newSystemSetting.getMaintenanceMode());

        // System fields
        if (newSystemSetting.getSystemName() != null)
            existingSetting.setSystemName(newSystemSetting.getSystemName());

        if (newSystemSetting.getAdminEmail() != null)
            existingSetting.setAdminEmail(newSystemSetting.getAdminEmail());

        if (newSystemSetting.getSupportEmail() != null)
            existingSetting.setSupportEmail(newSystemSetting.getSupportEmail());

        if (newSystemSetting.getSystemUrl() != null)
            existingSetting.setSystemUrl(newSystemSetting.getSystemUrl());

        if (newSystemSetting.getTimeZone() != null)
            existingSetting.setTimeZone(newSystemSetting.getTimeZone());

        if (newSystemSetting.getDefaultLanguage() != null)
            existingSetting.setDefaultLanguage(newSystemSetting.getDefaultLanguage());

        if (newSystemSetting.getMaintenanceMode() != null)
            existingSetting.setMaintenanceMode(newSystemSetting.getMaintenanceMode());

        // Notification settings
        if (newSystemSetting.getEmailNotificationEnabled() != null)
            existingSetting.setEmailNotificationEnabled(newSystemSetting.getEmailNotificationEnabled());

        // Security settings
        if (newSystemSetting.getMinimumPasswordLength() != null)
            existingSetting.setMinimumPasswordLength(newSystemSetting.getMinimumPasswordLength());

        if (newSystemSetting.getRequireSpecialCharacters() != null)
            existingSetting.setRequireSpecialCharacters(newSystemSetting.getRequireSpecialCharacters());

        if (newSystemSetting.getSessionTimeoutMinutes() != null)
            existingSetting.setSessionTimeoutMinutes(newSystemSetting.getSessionTimeoutMinutes());

        if (newSystemSetting.getMaxLoginAttempts() != null)
            existingSetting.setMaxLoginAttempts(newSystemSetting.getMaxLoginAttempts());

        if (newSystemSetting.getIpWhitelist() != null)
            existingSetting.setIpWhitelist(newSystemSetting.getIpWhitelist());

        // Internship fields
        if (newSystemSetting.getMaxInterns() != null)
            existingSetting.setMaxInterns(newSystemSetting.getMaxInterns());

        if (newSystemSetting.getInternshipDuration() != null)
            existingSetting.setInternshipDuration(newSystemSetting.getInternshipDuration());

        if (newSystemSetting.getReportFrequency() != null)
            existingSetting.setReportFrequency(newSystemSetting.getReportFrequency());

        if (newSystemSetting.getEvaluationDeadline() != null)
            existingSetting.setEvaluationDeadline(newSystemSetting.getEvaluationDeadline());

        SystemSetting updated = systemSettingRepo.save(existingSetting);
        if (!maintenanceModeBefore && maintenanceModeAfter) {
            try {
                notificationGrpcClient.sendNotification(
                        Set.of(RecipientRole.HR,RecipientRole.Student,RecipientRole.University,RecipientRole.Project_Manager, RecipientRole.Supervisor),       // send to university
                        "System Maintenance Mode Activated",    // title
                        "The system has been put under maintenance mode. Logins are temporarily disabled.", // description
                        Instant.now(),
                        NotificationType.ALERT
                );
            } catch (Exception e) {
                System.err.println("⚠️ Failed to send gRPC notification: " + e.getMessage());
            }
        }
        return updated;
    }

}
