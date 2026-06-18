package com.example.userservice.repository;

import com.example.userservice.model.InternManager;
import com.example.userservice.model.Project;
import com.example.userservice.model.Team;
import com.example.userservice.model.User;

import jakarta.transaction.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

@Repository
public class InternManagerReposImpl implements InternManagerReposInterface {

    private final InternManagerJpaRepos internManagerJpaRepos;

    @Autowired
    public InternManagerReposImpl(InternManagerJpaRepos internManagerJpaRepos) {
        this.internManagerJpaRepos = internManagerJpaRepos;
    }

    @Override
    public InternManager getInfo(Long userId) {
        return internManagerJpaRepos.findByUser_Id(userId);
    }

    @Override
    public List<InternManager> getInfos(List<Long> userIds) {
        return internManagerJpaRepos.findByUser_IdIn(userIds);
    }

    @Override
    public InternManager save(InternManager internManager) {
        return internManagerJpaRepos.save(internManager);
    }

    @Override
    @Transactional
    public List<InternManager> createOrUpdateInternManagers(
            List<Long> userIds,
            Long projectId,
            Long managerId,
            Long teamId
    ) {
        // Fetch existing records for given userIds
        List<InternManager> existingManagers = internManagerJpaRepos.findByUser_IdIn(userIds);

        // Map for quick lookup by userId
        Map<Long, InternManager> existingMap = existingManagers.stream()
                .collect(Collectors.toMap(im -> im.getUser().getId(), im -> im));

        List<InternManager> toSave = new ArrayList<>();

        for (Long userId : userIds) {
            InternManager internManager;

            if (existingMap.containsKey(userId)) {
                // Update existing record
                internManager = existingMap.get(userId);
            } else {
                // Create new record
                internManager = new InternManager();
                User user = new User();
                user.setId(userId);
                internManager.setUser(user);
            }

            // Set/update common fields
            if (projectId != null) {
                Project project = new Project();
                project.setId(projectId);
                internManager.setProject(project);
            }

            if (managerId != null) {
                User manager = new User();
                manager.setId(managerId);
                internManager.setManager(manager);
            }

            if (teamId != null) {
                Team team = new Team();
                team.setId(teamId);
                internManager.setTeam(team);
            }

            toSave.add(internManager);
        }

        // Save all (insert new or update existing)
        return internManagerJpaRepos.saveAll(toSave);
    }


    
}
