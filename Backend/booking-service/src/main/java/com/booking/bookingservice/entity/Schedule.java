package com.booking.bookingservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "schedules")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "route_id", nullable = false)
    private Route route;

    @ManyToOne
    @JoinColumn(name = "bus_id", nullable = false)
    private Bus bus;

    @Column(nullable = false)
    private LocalDateTime departureTime;

    private LocalDateTime arrivalTime;

    // how many seats are still available
    private Integer availableSeats;

    // SCHEDULED, RUNNING, COMPLETED, CANCELLED
    private String status = "SCHEDULED";

    private Double priceForThisTrip; // can override base price
    
    // Amenities
    @Column(name = "is_ac")
    private Boolean isAC = false;

    @Column(name = "is_sleeper")
    private Boolean isSleeper = false;

    @Column(name = "has_wifi")
    private Boolean hasWifi = false;

    // Driver relationship (3NF Normalized)
    @ManyToOne
    @JoinColumn(name = "driver_id")
    private Driver driver;

    @Transient
    public String getDriverName() {
        return driver != null ? driver.getFullName() : "Ramesh Kumar";
    }

    @Transient
    public String getDriverPhone() {
        return driver != null ? driver.getPhone() : "9876543210";
    }
}
