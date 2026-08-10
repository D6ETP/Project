package com.booking.bookingservice.controller;

import com.booking.bookingservice.entity.CityStop;
import com.booking.bookingservice.repository.CityStopRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/city-stops")
public class AdminCityStopController {

    @Autowired
    private CityStopRepository cityStopRepository;

    @GetMapping
    public ResponseEntity<List<CityStop>> getAllCityStops() {
        return ResponseEntity.ok(cityStopRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<CityStop> addCityStop(@RequestBody CityStop cityStop) {
        if (cityStop.getCity() == null || cityStop.getStopName() == null) {
            return ResponseEntity.badRequest().build();
        }
        if (cityStop.getActive() == null) {
            cityStop.setActive(true);
        }
        CityStop saved = cityStopRepository.save(cityStop);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<?> toggleCityStopStatus(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        if (role != null && !role.isEmpty() && !"ROLE_ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admins only");
        }
        CityStop stop = cityStopRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("City stop not found with id: " + id));
        stop.setActive(stop.getActive() == null || !stop.getActive());
        CityStop saved = cityStopRepository.save(stop);
        return ResponseEntity.ok(saved);
    }
}
