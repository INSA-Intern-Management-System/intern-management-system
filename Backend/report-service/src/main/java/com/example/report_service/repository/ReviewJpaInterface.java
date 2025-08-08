package com.example.report_service.repository;

import com.example.report_service.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ReviewJpaInterface extends JpaRepository<Review, Long> {

    // Find reviews by report IDs
    List<Review> findByReport_IdIn(List<Long> reportIds);
    Review findByReport_Id(Long reportId);

    // Average rating by internId (user)
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.report.intern.id = :userId")
    Double calculateAverageRatingByUserId(Long userId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.report.manager.id = :managerId")
    Double calculateAverageRatingByManagerId(Long managerId);



    @Query("SELECT AVG(r.rating) FROM Review r")
    Double calculateGlobalAverageRating();


}
