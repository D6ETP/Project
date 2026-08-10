package com.booking.bookingservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    private String passengerName;

    @Column(nullable = false)
    private Long busId;

    private Long scheduleId;

    @Column(nullable = false)
    private Integer rating; // 1 to 5

    @Column(length = 1000)
    private String comment;

    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    public void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
