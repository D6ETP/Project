package com.booking.bookingservice.repository;

import com.booking.bookingservice.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    // find schedules for a route on a given date (only upcoming SCHEDULED trips with available seats)
    @Query("SELECT s FROM Schedule s WHERE s.route.id = :routeId " +
           "AND s.departureTime >= :startOfDay AND s.departureTime <= :endOfDay " +
           "AND s.departureTime > :currentTime " +
           "AND (s.status IS NULL OR s.status = 'SCHEDULED') AND s.availableSeats > 0")
    List<Schedule> findAvailableSchedules(
        @Param("routeId") Long routeId,
        @Param("startOfDay") LocalDateTime startOfDay,
        @Param("endOfDay") LocalDateTime endOfDay,
        @Param("currentTime") LocalDateTime currentTime
    );

    List<Schedule> findByRouteIdAndStatus(Long routeId, String status);

    List<Schedule> findByStatus(String status);

    @Query("SELECT s FROM Schedule s WHERE s.bus.id = :busId " +
           "AND s.status != 'CANCELLED' AND s.status != 'COMPLETED' " +
           "AND (s.id != :excludeScheduleId OR :excludeScheduleId IS NULL) " +
           "AND (s.departureTime < :arrivalTime AND s.arrivalTime > :departureTime)")
    List<Schedule> findConflictingSchedules(
        @Param("busId") Long busId,
        @Param("departureTime") LocalDateTime departureTime,
        @Param("arrivalTime") LocalDateTime arrivalTime,
        @Param("excludeScheduleId") Long excludeScheduleId
    );

    @Query("SELECT s FROM Schedule s WHERE s.driver IS NOT NULL AND s.driver.id = :driverId " +
           "AND s.status != 'CANCELLED' AND s.status != 'COMPLETED' " +
           "AND (s.id != :excludeScheduleId OR :excludeScheduleId IS NULL) " +
           "AND (s.departureTime < :arrivalTime AND s.arrivalTime > :departureTime)")
    List<Schedule> findConflictingDriverSchedules(
        @Param("driverId") Long driverId,
        @Param("departureTime") LocalDateTime departureTime,
        @Param("arrivalTime") LocalDateTime arrivalTime,
        @Param("excludeScheduleId") Long excludeScheduleId
    );
}
