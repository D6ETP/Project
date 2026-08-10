package com.booking.bookingservice.repository;

import com.booking.bookingservice.entity.Seat;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findByScheduleId(Long scheduleId);

    List<Seat> findByScheduleIdAndStatus(Long scheduleId, String status);

    // This is the critical method — PESSIMISTIC_WRITE adds FOR UPDATE
    // Only one transaction can hold this lock at a time
    // Other transactions trying to fetch the same seat will WAIT
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Seat s WHERE s.id = :seatId")
    Optional<Seat> findByIdWithLock(@Param("seatId") Long seatId);
}
