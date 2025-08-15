package com.example.activity_service.repository;
import com.example.activity_service.model.Activity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

@Repository
public class ActivityService {

    private final ActivityJpaInterface activityRepository;

    public ActivityService(ActivityJpaInterface activityRepository) {
        this.activityRepository = activityRepository;
    }

    public Activity createActivity(Activity activity) {
        return activityRepository.save(activity);
    }

    public Page<Activity> getRecentActivities(Long userId, Pageable pageable) {
        return activityRepository.findByUser_IdOrderByCreatedAtDesc(userId, pageable);
    }
}
