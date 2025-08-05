package com.example.userservice.service;

import com.example.userservice.dto.CompanyProfileDTO;
import com.example.userservice.model.CompanySetting;

import java.util.List;

public interface CompanySettingService {

    CompanySetting registerCompany(CompanyProfileDTO companyProfileDTO);
    CompanyProfileDTO getCompanyProfile();
    CompanySetting updateCompanyProfile(CompanyProfileDTO companyProfileDTO);

}
