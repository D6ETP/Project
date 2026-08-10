package com.booking.authservice.service;

import com.booking.authservice.dto.AuthResponse;
import com.booking.authservice.dto.LoginRequest;
import com.booking.authservice.dto.RegisterRequest;
import com.booking.authservice.entity.User;
import com.booking.authservice.repository.UserRepository;
import com.booking.authservice.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private AuthenticationManager authenticationManager;

	@Autowired
	private JwtUtil jwtUtil;

	public void checkEmailAvailable(String email) {
		if (userRepository.existsByEmail(email)) {
			throw new RuntimeException("Email already registered. Please use a different email or login.");
		}
	}

	public void checkEmailExists(String email) {
		if (!userRepository.existsByEmail(email)) {
			throw new RuntimeException("Email is not registered.");
		}
	}

	public AuthResponse register(RegisterRequest req) {
		if (userRepository.existsByEmail(req.getEmail())) {
			throw new RuntimeException("Email already in use");
		}

		User user = new User();
		user.setFullName(req.getFullName());
		user.setEmail(req.getEmail());
		user.setPassword(passwordEncoder.encode(req.getPassword()));
		user.setRole(req.getRole());
		user.setPhone(req.getPhone());
		user.setActive(true);

		User saved = userRepository.save(user);
		System.out.println("New user registered: " + saved.getEmail());

		// Publish Welcome email event to notification-service

		String token = jwtUtil.generateToken(saved);
		return buildResponse(saved, token);
	}

	public AuthResponse login(LoginRequest req) {
		try {
			authenticationManager.authenticate(
					new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
		} catch (BadCredentialsException e) {
			throw new RuntimeException("Wrong email or password");
		}

		User user = userRepository.findByEmail(req.getEmail())
				.orElseThrow(() -> new RuntimeException("User not found"));

		String token = jwtUtil.generateToken(user);
		return buildResponse(user, token);
	}

	public void changePassword(String email, String oldPassword, String newPassword) {
		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new RuntimeException("User not found"));

		if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
			throw new RuntimeException("Current password is incorrect");
		}

		if (newPassword.length() < 8) {
			throw new RuntimeException("New password must be at least 8 characters");
		}

		user.setPassword(passwordEncoder.encode(newPassword));
		userRepository.save(user);
		System.out.println("Password changed for: " + email);
	}

	public void resetPassword(String email, String newPassword) {
		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new RuntimeException("User not found"));

		if (newPassword.length() < 8) {
			throw new RuntimeException("New password must be at least 8 characters");
		}

		user.setPassword(passwordEncoder.encode(newPassword));
		userRepository.save(user);
		System.out.println("Password reset for: " + email);
	}

	public AuthResponse updateProfile(String userId, String fullName, String phone) {
		User user = userRepository.findById(Long.parseLong(userId))
				.orElseThrow(() -> new RuntimeException("User not found"));

		if (fullName != null && !fullName.isBlank()) {
			user.setFullName(fullName);
		}
		if (phone != null && !phone.isBlank()) {
			user.setPhone(phone);
		}

		userRepository.save(user);

		String token = jwtUtil.generateToken(user);
		return buildResponse(user, token);
	}

	private AuthResponse buildResponse(User user, String token) {
		AuthResponse res = new AuthResponse();
		res.setToken(token);
		res.setTokenType("Bearer");
		res.setUserId(String.valueOf(user.getId()));
		res.setEmail(user.getEmail());
		res.setRole(user.getRole());
		res.setFullName(user.getFullName());
		res.setPhone(user.getPhone());
		res.setWalletBalance(user.getWalletBalance());
		res.setExpiresIn(jwtUtil.getExpiryMs() / 1000);
		return res;
	}
}
