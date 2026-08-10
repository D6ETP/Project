package com.booking.authservice.controller;

import com.booking.authservice.dto.AuthResponse;
import com.booking.authservice.dto.LoginRequest;
import com.booking.authservice.dto.RegisterRequest;
import com.booking.authservice.service.AuthService;
import com.booking.authservice.service.OtpService;
import jakarta.validation.Valid;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

	@Autowired
	private AuthService authService;

	@Autowired
	private OtpService otpService;

	// ─────────────────────────────────────────────────────────
	// POST /auth/send-otp
	// Step 1 of registration: validate email isn't taken, then send OTP
	// ─────────────────────────────────────────────────────────
	@PostMapping("/send-otp")
	public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> body) {
		String email = body.get("email");
		if (email == null || email.isBlank()) {
			return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
		}
		try {
			// Check email isn't already registered before sending OTP
			authService.checkEmailAvailable(email);
			otpService.generateAndSend(email);
			return ResponseEntity.ok(Map.of("message", "OTP sent to " + email));
		} catch (RuntimeException e) {
			Map<String, String> error = new HashMap<>();
			error.put("message", e.getMessage());
			return ResponseEntity.badRequest().body(error);
		}
	}

	// ─────────────────────────────────────────────────────────
	// POST /auth/verify-otp
	// Step 2 of registration: verify OTP before completing registration
	// ─────────────────────────────────────────────────────────
	@PostMapping("/verify-otp")
	public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
		String email = body.get("email");
		String otp = body.get("otp");
		if (email == null || otp == null) {
			return ResponseEntity.badRequest().body(Map.of("message", "Email and OTP are required"));
		}
		boolean valid = otpService.verify(email, otp);
		if (!valid) {
			return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired OTP. Please try again."));
		}
		return ResponseEntity.ok(Map.of("message", "OTP verified successfully"));
	}

	// ─────────────────────────────────────────────────────────
	// POST /auth/register
	// Step 3 (final): register user after OTP is verified on frontend
	// ─────────────────────────────────────────────────────────
	@PostMapping("/register")
	public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
		try {
			AuthResponse response = authService.register(req);
			return ResponseEntity.status(HttpStatus.CREATED).body(response);
		} catch (RuntimeException e) {
			Map<String, String> error = new HashMap<>();
			error.put("message", e.getMessage());
			return ResponseEntity.badRequest().body(error);
		}
	}

	// ─────────────────────────────────────────────────────────
	// POST /auth/login
	// ─────────────────────────────────────────────────────────
	@PostMapping("/login")
	public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
		try {
			AuthResponse response = authService.login(req);
			return ResponseEntity.ok(response);
		} catch (RuntimeException e) {
			Map<String, String> error = new HashMap<>();
			error.put("message", e.getMessage());
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
		}
	}

	// ─────────────────────────────────────────────────────────
	// POST /auth/change-password
	// Body: { email, oldPassword, newPassword }
	// ─────────────────────────────────────────────────────────
	@PostMapping("/change-password")
	public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest req) {
		try {
			authService.changePassword(req.getEmail(), req.getOldPassword(), req.getNewPassword());
			return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
		} catch (RuntimeException e) {
			return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
		}
	}

	@PostMapping("/forgot-password-otp")
	public ResponseEntity<?> forgotPasswordOtp(@RequestBody Map<String, String> body) {
		String email = body.get("email");
		if (email == null || email.isBlank()) {
			return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
		}
		try {
			authService.checkEmailExists(email);
			otpService.generateAndSendPasswordReset(email);
			return ResponseEntity.ok(Map.of("message", "OTP sent to " + email));
		} catch (RuntimeException e) {
			return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
		}
	}

	@PostMapping("/reset-password")
	public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
		String email = body.get("email");
		String otp = body.get("otp");
		String newPassword = body.get("newPassword");

		if (email == null || otp == null || newPassword == null) {
			return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields"));
		}

		boolean valid = otpService.verify(email, otp);
		if (!valid) {
			return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired OTP."));
		}

		try {
			authService.resetPassword(email, newPassword);
			return ResponseEntity.ok(Map.of("message", "Password reset successfully. You can now login."));
		} catch (RuntimeException e) {
			return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
		}
	}

	@PutMapping("/update-profile")
	public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> body) {
		try {
			String userId = body.get("userId");
			String fullName = body.get("fullName");
			String phone = body.get("phone");
			if (userId == null || userId.isBlank()) {
				return ResponseEntity.badRequest().body(Map.of("message", "User ID is required"));
			}
			AuthResponse updated = authService.updateProfile(userId, fullName, phone);
			return ResponseEntity.ok(updated);
		} catch (RuntimeException e) {
			return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
		}
	}

	@GetMapping("/ping")
	public ResponseEntity<String> ping() {
		return ResponseEntity.ok("auth-service is up");
	}

	@Data
	static class ChangePasswordRequest {
		private String email;
		private String oldPassword;
		private String newPassword;
	}
}
