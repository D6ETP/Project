package com.booking.bookingservice.repository;

import com.booking.bookingservice.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);

    List<Booking> findByScheduleId(Long scheduleId);

    @Query("SELECT DISTINCT b.contactEmail FROM Booking b WHERE b.schedule.id = :scheduleId AND b.status = 'CONFIRMED' AND b.contactEmail IS NOT NULL AND b.contactEmail <> ''")
    List<String> findDistinctContactEmailsByScheduleId(@Param("scheduleId") Long scheduleId);
}
