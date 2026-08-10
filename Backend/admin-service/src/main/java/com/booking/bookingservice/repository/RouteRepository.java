package com.booking.bookingservice.repository;

import com.booking.bookingservice.entity.Route;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RouteRepository extends JpaRepository<Route, Long> {

    // search routes by source and destination (case insensitive)
    List<Route> findBySourceIgnoreCaseAndDestinationIgnoreCaseAndActiveTrue(
        String source, String destination
    );

    List<Route> findByActiveTrue();
}
