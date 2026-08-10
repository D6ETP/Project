package com.booking.authservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

	@NotBlank(message = "Name cannot be empty")
	private String fullName;

	@NotBlank
	@Email(message = "Enter a valid email")
	private String email;

	@NotBlank
	@Size(min = 8, message = "Password must be at least 8 characters")
	private String password;

	private String phone; // Optional phone number

	// default is passenger, admin won't register through this endpoint anyway
	private String role = "ROLE_PASSENGER";
}

