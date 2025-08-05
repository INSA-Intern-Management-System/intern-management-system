package com.example.report_service.repository;

import com.example.report_service.model.Review;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class ReviewInterfaceImpl implements ReviewReposInterface {

    private final ReviewJpaInterface reviewJpa;

    @Autowired
    public ReviewInterfaceImpl(ReviewJpaInterface reviewJpa) {
        this.reviewJpa = reviewJpa;
    }

    @Override
    public Review saveReview(Review review) {
        return reviewJpa.save(review);
    }

    @Override
    public List<Review> findByReportIds(List<Long> reportIds) {
        return reviewJpa.findByReport_IdIn(reportIds);
    }

    @Override
    public Double calculateAverageRatingByUserId(Long userId) {
        return reviewJpa.calculateAverageRatingByUserId(userId);
    }

    @Override
    public Double calculateAverageRatingByManagerId(Long managerId) {
        return reviewJpa.calculateAverageRatingByManagerId(managerId);
    }
    @Override
    public Double calculateGlobalAverageRating() {
        Double avg = reviewJpa.calculateGlobalAverageRating();
        return avg != null ? avg : 0.0;
    }
    @Override
    public Review findByReportId(Long reportId) {
        return reviewJpa.findByReport_Id(reportId);
    }

}
