package com.booking.bookingservice.controller;

import com.booking.bookingservice.entity.Seat;
import com.booking.bookingservice.service.SeatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/seats")
public class SeatController {

    @Autowired
    private SeatService seatService;

    // GET /seats/schedule/5 — get all seats for a schedule
    @GetMapping("/schedule/{scheduleId}")
    public ResponseEntity<List<Seat>> getSeatsBySchedule(@PathVariable Long scheduleId) {
        return ResponseEntity.ok(seatService.getSeatsBySchedule(scheduleId));
    }

    // GET /seats/schedule/5/available — only available seats
    @GetMapping("/schedule/{scheduleId}/available")
    public ResponseEntity<List<Seat>> getAvailableSeats(@PathVariable Long scheduleId) {
        return ResponseEntity.ok(seatService.getAvailableSeats(scheduleId));
    }
}
