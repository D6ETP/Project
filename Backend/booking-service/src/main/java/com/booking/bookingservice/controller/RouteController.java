package com.booking.bookingservice.controller;

import com.booking.bookingservice.dto.ScheduleResponse;
import com.booking.bookingservice.entity.Bus;
import com.booking.bookingservice.entity.Route;
import com.booking.bookingservice.repository.BusRepository;
import com.booking.bookingservice.service.RouteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/routes")
public class RouteController {

    @Autowired
    private RouteService routeService;

    @Autowired
    private BusRepository busRepository;

    @GetMapping
    public ResponseEntity<List<Route>> getAllRoutes() {
        return ResponseEntity.ok(routeService.getAllRoutes());
    }

    @GetMapping("/buses")
    public ResponseEntity<List<Bus>> getAllPublicBuses() {
        return ResponseEntity.ok(busRepository.findAll());
    }

    @GetMapping("/active-schedules")
    public ResponseEntity<List<ScheduleResponse>> getActiveSchedules() {
        return ResponseEntity.ok(routeService.getAllScheduledTrips());
    }

    @GetMapping("/stops")
    public ResponseEntity<List<String>> getStops(@RequestParam String city) {
        return ResponseEntity.ok(routeService.getStopsForCity(city));
    }

    // GET /routes/search?source=Mumbai&destination=Pune&date=2024-12-25
    @GetMapping("/search")
    public ResponseEntity<List<ScheduleResponse>> searchRoutes(
            @RequestParam String source,
            @RequestParam String destination,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        if (date == null) {
            date = LocalDate.now();
        }

        List<ScheduleResponse> schedules = routeService.searchSchedules(source, destination, date);
        return ResponseEntity.ok(schedules);
    }
}
