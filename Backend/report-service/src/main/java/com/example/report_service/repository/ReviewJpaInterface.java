package com.example.report_service.repository;

import com.example.report_service.dto.InternRatingProjection;
import com.example.report_service.model.Review;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewJpaInterface extends JpaRepository<Review, Long> {

    // Find reviews by report IDs
    List<Review> findByReport_IdIn(List<Long> reportIds);
    Review findByReport_Id(Long reportId);

    // Average rating by internId (user)
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.report.intern.id = :userId")
    Double calculateAverageRatingByUserId(@Param("userId") Long userId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.report.manager.id = :managerId")
    Double calculateAverageRatingByManagerId(@Param("managerId") Long managerId);



    @Query("SELECT AVG(r.rating) FROM Review r")
    Double calculateGlobalAverageRating();

    @Query("SELECT r.report.intern.id as internId, AVG(r.rating) as averageRating " +
       "FROM Review r " +
       "GROUP BY r.report.intern.id " +
       "ORDER BY averageRating DESC")
    List<InternRatingProjection> findTopInternsByAverageRating(Pageable pageable);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.report.intern.id IN :userIds")
    Double calculateAverageRatingForUsers(@Param("userIds") List<Long> userIds);

    @Query("""
    SELECT r 
    FROM Review r
    WHERE r.report.project.id IN :projectIds
    AND r.createdAt = (
        SELECT MAX(r2.createdAt)
        FROM Review r2
        WHERE r2.report.project.id = r.report.project.id
    )
    """)
    List<Review> findLastReviewByProjectIds(@Param("userIds") List<Long> projectIds);

    @Query("""
    SELECT r
    FROM Review r
    WHERE r.report.intern.id IN :userIds
    AND r.createdAt = (
        SELECT MAX(r2.createdAt)
        FROM Review r2
        WHERE r2.report.intern.id = r.report.intern.id
    )
    """)
    List<Review> findLastReviewByUserIds(@Param("userIds") List<Long> userIds);


    // @Query("SELECT r.report.intern.id AS userId, AVG(r.rating) AS averageRating " +
    //    "FROM Review r " +
    //    "WHERE r.report.intern.id IS NOT NULL AND r.report.intern.id IN :userIds " +
    //    "GROUP BY r.report.intern.id")
    // List<InternRatingProjection> calculateAverageRatingsForUsers(@Param("userIds") List<Long> userIds);

    @Query("SELECT r.report.intern.id AS internId, AVG(r.rating) AS averageRating " +
        "FROM Review r " +
        "WHERE r.report.intern.id IN :userIds " +
        "GROUP BY r.report.intern.id")
    List<InternRatingProjection> calculateAverageRatingsForUsers(List<Long> userIds);






}
