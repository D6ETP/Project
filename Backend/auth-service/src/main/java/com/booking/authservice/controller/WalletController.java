package com.booking.authservice.controller;

import com.booking.authservice.entity.User;
import com.booking.authservice.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth/wallet")
public class WalletController {

    private static final Logger log = LoggerFactory.getLogger(WalletController.class);

    @Autowired
    private UserRepository userRepository;

    // GET /wallet -> returns balance of the current user
    @GetMapping
    public ResponseEntity<?> getBalance(
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestParam(value = "userId", required = false) Long paramUserId) {
        
        Long userId = headerUserId != null ? headerUserId : paramUserId;
        if (userId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing User ID"));
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        double currentBalance = user.getWalletBalance() != null ? user.getWalletBalance() : 0.0;
        return ResponseEntity.ok(Map.of("walletBalance", currentBalance));
    }

    // POST /wallet/add -> internal or user endpoint to add money (e.g. from refund or wallet top-up)
    @PostMapping("/add")
    public ResponseEntity<?> addMoney(
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestBody Map<String, Object> request) {
        
        Long userId = headerUserId;
        if (userId == null && request.get("userId") != null) {
            try {
                userId = Long.valueOf(request.get("userId").toString());
            } catch (NumberFormatException ignored) {}
        }

        if (userId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "User ID is required"));
        }

        Object amountObj = request.get("amount");
        if (amountObj == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Amount is required"));
        }
        
        Double amount;
        try {
            amount = Double.valueOf(amountObj.toString());
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid amount format"));
        }

        if (amount <= 0) {
            return ResponseEntity.badRequest().body(Map.of("message", "Amount must be positive"));
        }

        final Long finalUserId = userId;
        User user = userRepository.findById(finalUserId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + finalUserId));
        
        double currentBalance = user.getWalletBalance() != null ? user.getWalletBalance() : 0.0;
        double newBalance = Math.round((currentBalance + amount) * 100.0) / 100.0;
        user.setWalletBalance(newBalance);
        userRepository.save(user);

        log.info("Added {} to wallet for user {}. New balance: {}", amount, userId, newBalance);
        return ResponseEntity.ok(Map.of("message", "Amount added successfully", "newBalance", newBalance));
    }

    // POST /wallet/deduct -> internal endpoint to deduct money (e.g. for booking)
    @PostMapping("/deduct")
    public ResponseEntity<?> deductMoney(
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestBody Map<String, Object> request) {
        
        Long userId = headerUserId;
        if (userId == null && request.get("userId") != null) {
            try {
                userId = Long.valueOf(request.get("userId").toString());
            } catch (NumberFormatException ignored) {}
        }

        if (userId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "User ID is required"));
        }

        Object amountObj = request.get("amount");
        if (amountObj == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Amount is required"));
        }
        
        Double amount;
        try {
            amount = Double.valueOf(amountObj.toString());
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid amount format"));
        }

        if (amount <= 0) {
            return ResponseEntity.badRequest().body(Map.of("message", "Amount must be positive"));
        }

        final Long finalUserId = userId;
        User user = userRepository.findById(finalUserId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + finalUserId));
        
        double currentBalance = user.getWalletBalance() != null ? user.getWalletBalance() : 0.0;
        if (currentBalance < amount) {
            return ResponseEntity.badRequest().body(Map.of("message", "Insufficient wallet balance"));
        }

        double newBalance = Math.round((currentBalance - amount) * 100.0) / 100.0;
        user.setWalletBalance(newBalance);
        userRepository.save(user);

        log.info("Deducted {} from wallet for user {}. New balance: {}", amount, userId, newBalance);
        return ResponseEntity.ok(Map.of("message", "Amount deducted successfully", "newBalance", newBalance));
    }
}
