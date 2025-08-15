package com.example.userservice.service;

import com.example.userservice.dto.InternManagerResponseDTO;
import com.example.userservice.model.InternManager;
import com.example.userservice.repository.InternManagerReposInterface;

public class InternManagerService {

    private final InternManagerReposInterface internManagerReposInterface;

    public InternManagerService(InternManagerReposInterface internManagerReposInterface) {
        this.internManagerReposInterface = internManagerReposInterface;
    }

    public InternManagerResponseDTO getInfoIdByUserId(Long userId) {
        //get and store the intern manager information by user ID
        //if the intern manager is not found, throw an excepti
        InternManager internManager = internManagerReposInterface.getInfo(userId);
        if (internManager == null) {
            throw new RuntimeException("Intern infos  not found for user ID: " + userId);
        }
        //map to the InternManagerDTO if needed
        InternManagerResponseDTO internManagerDTO = new InternManagerResponseDTO();
        internManagerDTO.setId(internManager.getId());
        internManagerDTO.setUserId(internManager.getUser().getId());
        internManagerDTO.setManagerId(internManager.getManager().getId());
        internManagerDTO.setProjectId(internManager.getProject().getId());
        internManagerDTO.setTeamId(internManager.getTeam().getId());
        return internManagerDTO;

    }

}
