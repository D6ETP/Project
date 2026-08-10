package com.notification.notificationservice.controller;

import com.notification.notificationservice.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendRegistrationOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp = body.get("otp");
        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and OTP are required"));
        }
        emailService.sendRegistrationOtp(email, otp);
        return ResponseEntity.ok(Map.of("message", "Registration OTP email triggered for " + email));
    }

    @PostMapping("/send-reset-otp")
    public ResponseEntity<?> sendPasswordResetOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp = body.get("otp");
        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and OTP are required"));
        }
        emailService.sendPasswordResetOtp(email, otp);
        return ResponseEntity.ok(Map.of("message", "Password Reset OTP email triggered for " + email));
    }

    @PostMapping("/send-reset-success")
    public ResponseEntity<?> sendPasswordResetSuccess(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }
        emailService.sendPasswordResetSuccessEmail(email);
        return ResponseEntity.ok(Map.of("message", "Password Reset success email triggered for " + email));
    }

    @PostMapping("/send-welcome")
    public ResponseEntity<?> sendWelcomeEmail(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String fullName = body.getOrDefault("fullName", "Traveler");
        if (email == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }
        emailService.sendWelcomeEmail(email, fullName);
        return ResponseEntity.ok(Map.of("message", "Welcome email triggered for " + email));
    }

    @PostMapping("/send-ticket")
    public ResponseEntity<?> sendBookingTicket(@RequestBody Map<String, Object> body) {
        String email = String.valueOf(body.get("email"));
        java.util.List<Map<String, Object>> bookings = (java.util.List<Map<String, Object>>) body.get("bookings");
        if (email == null || bookings == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and bookings are required"));
        }
        emailService.sendBookingConfirmation(email, bookings);
        return ResponseEntity.ok(Map.of("message", "Ticket confirmation email triggered for " + email));
    }

    @PostMapping("/send-cancellation")
    public ResponseEntity<?> sendBookingCancellation(@RequestBody Map<String, Object> body) {
        String email = String.valueOf(body.get("email"));
        if (email == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }
        emailService.sendBookingCancellationNotification(email, body);
        return ResponseEntity.ok(Map.of("message", "Booking cancellation email triggered for " + email));
    }

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("notification-service is healthy");
    }
}
