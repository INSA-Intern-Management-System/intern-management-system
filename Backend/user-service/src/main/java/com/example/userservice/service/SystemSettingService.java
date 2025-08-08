package com.example.userservice.service;


import com.example.userservice.model.SystemSetting;


public interface SystemSettingService {

    SystemSetting registerSystem(SystemSetting systemSetting);
    SystemSetting getSystemSetting();
    SystemSetting updateSystemSetting(SystemSetting systemSetting);
}
