package com.booking.bookingservice.repository;

import com.booking.bookingservice.entity.CityStop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CityStopRepository extends JpaRepository<CityStop, Long> {
    List<CityStop> findByCityIgnoreCase(String city);
}
