package com.booking.bookingservice.controller;

import com.booking.bookingservice.dto.BookingRequest;
import com.booking.bookingservice.dto.BookingResponse;
import com.booking.bookingservice.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    // POST /bookings — create a booking
    // userId comes from X-User-Id header set by the gateway
    @PostMapping
    public ResponseEntity<?> book(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody BookingRequest request) {
        try {
            BookingResponse response = bookingService.bookSeat(userId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // POST /bookings/bulk — create multiple bookings (one transaction)
    @PostMapping("/bulk")
    public ResponseEntity<?> bookBulk(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody com.booking.bookingservice.dto.BulkBookingRequest request) {
        try {
            List<BookingResponse> responses = bookingService.bookSeatsBulk(userId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(responses);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // DELETE /bookings/3 — cancel booking
    @DeleteMapping("/{bookingId}")
    public ResponseEntity<?> cancel(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long bookingId) {
        try {
            String message = bookingService.cancelBooking(bookingId, userId);
            Map<String, String> response = new HashMap<>();
            response.put("message", message);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // GET /bookings/my — get current user's bookings
    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> myBookings(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(bookingService.getMyBookings(userId));
    }

    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationExceptions(org.springframework.web.bind.MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errors.put(error.getField(), error.getDefaultMessage()));
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Validation failed: " + errors.toString());
        return ResponseEntity.badRequest().body(response);
    }

    // Internal endpoint used by notification-service to fetch passenger contact emails for a schedule
    @Autowired
    private com.booking.bookingservice.repository.BookingRepository bookingRepository;

    @GetMapping("/internal/schedule/{scheduleId}/contact-emails")
    public ResponseEntity<List<String>> getContactEmailsBySchedule(@PathVariable Long scheduleId) {
        List<String> emails = bookingRepository.findDistinctContactEmailsByScheduleId(scheduleId);
        return ResponseEntity.ok(emails);
    }
}

