package com.booking.authservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String fullName;

	@Column(nullable = false, unique = true)
	private String email;

	@Column(nullable = false)
	private String password; // bcrypt hash

	@Column(nullable = false)
	private String role; // ROLE_PASSENGER, ROLE_DRIVER, ROLE_ADMIN

	@Column(nullable = false)
	private boolean active = true;

	private String phone;

	@Column(nullable = false)
	private Double walletBalance = 0.0;

	private LocalDateTime createdAt;

	@PrePersist
	public void setCreatedAt() {
		this.createdAt = LocalDateTime.now();
	}
}
