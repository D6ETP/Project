package com.booking.bookingservice.repository;

import com.booking.bookingservice.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByBusIdOrderByCreatedAtDesc(Long busId);

    List<Review> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.busId = :busId")
    Double findAverageRatingByBusId(@Param("busId") Long busId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.busId = :busId")
    Integer countReviewsByBusId(@Param("busId") Long busId);
}
