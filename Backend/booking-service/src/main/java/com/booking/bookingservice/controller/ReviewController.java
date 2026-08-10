package com.booking.bookingservice.controller;

import com.booking.bookingservice.entity.Review;
import com.booking.bookingservice.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reviews")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @PostMapping
    public ResponseEntity<Review> submitReview(@RequestBody Review review) {
        if (review.getRating() == null || review.getRating() < 1 || review.getRating() > 5) {
            return ResponseEntity.badRequest().build();
        }
        Review saved = reviewRepository.save(review);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/bus/{busId}")
    public ResponseEntity<Map<String, Object>> getBusReviews(@PathVariable Long busId) {
        List<Review> reviews = reviewRepository.findByBusIdOrderByCreatedAtDesc(busId);
        Double avgRating = reviewRepository.findAverageRatingByBusId(busId);
        Integer total = reviewRepository.countReviewsByBusId(busId);

        Map<String, Object> res = new HashMap<>();
        res.put("reviews", reviews);
        res.put("averageRating", avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 4.8);
        res.put("totalReviews", total != null ? total : 0);

        return ResponseEntity.ok(res);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Review>> getUserReviews(@PathVariable Long userId) {
        return ResponseEntity.ok(reviewRepository.findByUserIdOrderByCreatedAtDesc(userId));
    }
}
