package com.booking.bookingservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String bookingReference;

    // we get userId from the JWT via the X-User-Id header (set by gateway)
    // we don't store full user object here, just the id (loose coupling)
    @Column(nullable = false)
    private Long userId;

    @ManyToOne
    @JoinColumn(name = "schedule_id", nullable = false)
    private Schedule schedule;

    @ManyToOne
    @JoinColumn(name = "seat_id", nullable = false)
    private Seat seat;

    // CONFIRMED, CANCELLED
    private String status = "CONFIRMED";

    private Double amountPaid;

    @Column(nullable = false)
    private LocalDateTime bookedAt;

    // Passenger Details
    private String passengerName;
    private Integer passengerAge;
    private String passengerGender;

    // Contact Details (shared across multiple bookings for the same user)
    private String contactEmail;
    private String contactPhone;

    // Boarding & Dropping Points
    private String boardingPoint;
    private String droppingPoint;

    @PrePersist
    public void setBookedAt() {
        this.bookedAt = LocalDateTime.now();
    }
}
