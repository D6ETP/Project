package com.booking.authservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {

	private String token;
	private String tokenType = "Bearer";
	private String userId;
	private String email;
	private String role;
	private String fullName;
	private String phone;
	private Double walletBalance;
	private long expiresIn; // in seconds
}

