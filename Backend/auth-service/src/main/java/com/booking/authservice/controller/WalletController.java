package com.booking.authservice.controller;

import com.booking.authservice.entity.User;
import com.booking.authservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth/wallet")
public class WalletController {

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
        return ResponseEntity.ok(Map.of("walletBalance", user.getWalletBalance()));
    }

    // POST /wallet/add -> internal endpoint to add money (e.g. from refund)
    @PostMapping("/add")
    public ResponseEntity<?> addMoney(@RequestHeader("X-User-Id") Long userId, @RequestBody Map<String, Object> request) {
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

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setWalletBalance(user.getWalletBalance() + amount);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Amount added successfully", "newBalance", user.getWalletBalance()));
    }

    // POST /wallet/deduct -> internal endpoint to deduct money (e.g. for booking)
    @PostMapping("/deduct")
    public ResponseEntity<?> deductMoney(@RequestHeader("X-User-Id") Long userId, @RequestBody Map<String, Object> request) {
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

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getWalletBalance() < amount) {
            return ResponseEntity.badRequest().body(Map.of("message", "Insufficient wallet balance"));
        }

        user.setWalletBalance(user.getWalletBalance() - amount);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Amount deducted successfully", "newBalance", user.getWalletBalance()));
    }
}
