package com.booking.bookingservice.repository;

import com.booking.bookingservice.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);

    List<Booking> findByScheduleId(Long scheduleId);

    // Fetch all CONFIRMED bookings for a specific bus number (bus-wise passenger report)
    @Query("SELECT b FROM Booking b WHERE b.schedule.bus.busNumber = :busNumber AND b.status = 'CONFIRMED' " +
           "ORDER BY b.schedule.departureTime ASC, b.seat.seatNumber ASC")
    List<Booking> findConfirmedBookingsByBusNumber(@Param("busNumber") String busNumber);
}
