package com.example.report_service.repository;

import com.example.report_service.dto.InternRatingProjection;
import com.example.report_service.model.Review;

import java.util.List;

import org.springframework.data.domain.Pageable;

public interface ReviewReposInterface {
    Review saveReview(Review review);
    List<Review> findByReportIds(List<Long> reportIds);
    Double calculateAverageRatingByUserId(Long userId);
    Double calculateAverageRatingByManagerId(Long managerId);
    Double calculateGlobalAverageRating();
    Review findByReportId(Long reportId);

    List<InternRatingProjection> getTopKthInterns(Pageable pageable);

}
