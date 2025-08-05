package com.example.userservice.service;

import com.example.userservice.dto.CompanyProfileDTO;
import com.example.userservice.model.CompanySetting;
import com.example.userservice.repository.CompanySettingRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CompanySettingServiceImpl implements CompanySettingService{

    private final CompanySettingRepository companySettingRepository;

    public CompanySettingServiceImpl(CompanySettingRepository companySettingRepository){
        this.companySettingRepository = companySettingRepository;

    }


    @Override
    public CompanyProfileDTO getCompanyProfile() {
        CompanySetting companySetting = companySettingRepository.findTopByOrderByIdAsc()
                .orElseThrow(() -> new RuntimeException("Company profile not found"));

        CompanyProfileDTO dto = new CompanyProfileDTO();
        BeanUtils.copyProperties(companySetting, dto); // Or map manually
        return dto;
    }


    @Override
    public CompanySetting updateCompanyProfile(CompanyProfileDTO updatedProfile) {
        CompanySetting existingProfile = companySettingRepository.findTopByOrderByIdAsc()
                .orElseThrow(() -> new RuntimeException("Company profile not found"));

        // Update only the necessary fields
        existingProfile.setCompanyName(updatedProfile.getCompanyName());
        existingProfile.setCompanySize(updatedProfile.getCompanySize());
        existingProfile.setAddress(updatedProfile.getAddress());
        existingProfile.setIndustry(updatedProfile.getIndustry());
        existingProfile.setWebsite(updatedProfile.getWebsite());
        existingProfile.setCompanyDescription(updatedProfile.getCompanyDescription());

        existingProfile.setMaxInternsAllowed(updatedProfile.getMaxInternsAllowed());
        existingProfile.setMinIntershipDuration(updatedProfile.getMinIntershipDuration());
        existingProfile.setCVRequired(updatedProfile.getCVRequired());
        existingProfile.setGPARequired(updatedProfile.getGPARequired());

        existingProfile.setEmailNotification(updatedProfile.getEmailNotification());

        existingProfile.setTwoFactorEnabled(updatedProfile.getTwoFactorEnabled());

        return companySettingRepository.save(existingProfile);
    }

    @Override
    public CompanySetting registerCompany(CompanyProfileDTO dto) {
        CompanySetting setting = new CompanySetting();

        setting.setCompanyName(dto.getCompanyName());
        setting.setIndustry(dto.getIndustry());
        setting.setCompanySize(dto.getCompanySize());
        setting.setAddress(dto.getAddress());
        setting.setWebsite(dto.getWebsite());
        setting.setCompanyDescription(dto.getCompanyDescription());
        setting.setMaxInternsAllowed(dto.getMaxInternsAllowed());
        setting.setMinIntershipDuration(dto.getMinIntershipDuration());
        setting.setCVRequired(dto.getCVRequired());
        setting.setGPARequired(dto.getGPARequired());

        // Set defaults
        setting.setEmailNotification(dto.getEmailNotification());
         // or make this Boolean if preferred
        setting.setTwoFactorEnabled(false);

        return companySettingRepository.save(setting);
    }

}
