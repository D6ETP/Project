package com.booking.bookingservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "seats")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "schedule"})
    private Schedule schedule;

    @Column(nullable = false)
    private String seatNumber; // like A1, A2, B1 etc

    // AVAILABLE, BOOKED
    @Column(nullable = false)
    private String status = "AVAILABLE";

    // @Version enables optimistic locking as a backup
    // JPA automatically increments this on every update
    // if two transactions try to update the same row, one will get
    // an OptimisticLockException
    @Version
    private Integer version;
}
