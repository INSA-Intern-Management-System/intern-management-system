package com.example.userservice.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.userservice.dto.InternManagerResponseDTO;
import com.example.userservice.model.InternManager;
import com.example.userservice.repository.InternManagerReposInterface;


@Service
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

        //handle null cases for all
        if (internManager != null) {
            internManagerDTO.setId(internManager.getId());
        }

        if (internManager.getUser() != null) {
            internManagerDTO.setUserId(internManager.getUser().getId());
        }
        if (internManager.getManager() != null) {
            internManagerDTO.setManagerId(internManager.getManager().getId());
        }
        if (internManager.getProject() != null) {
             internManagerDTO.setProjectId(internManager.getProject().getId());
        }
        if (internManager.getMentor() != null) {
            internManagerDTO.setMentorId(internManager.getMentor().getId());
        }
        if (internManager.getTeam() != null) {
            internManagerDTO.setTeamId(internManager.getTeam().getId());
        }
        return internManagerDTO;

    }
    public List<InternManager> getInfos(List<Long> ids) {
        return internManagerReposInterface.getInfos(ids);
    }

}
