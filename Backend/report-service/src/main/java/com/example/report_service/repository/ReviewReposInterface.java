package com.example.report_service.repository;

import com.example.report_service.model.Review;

import java.util.List;

public interface ReviewReposInterface {
    Review saveReview(Review review);
    List<Review> findByReportIds(List<Long> reportIds);
    Double calculateAverageRatingByUserId(Long userId);
    Double calculateAverageRatingByManagerId(Long managerId);
    Double calculateGlobalAverageRating();
    Review findByReportId(Long reportId);

}
