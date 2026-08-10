package com.booking.authservice.util;

import com.booking.authservice.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

	@Value("${jwt.secret}")
	private String secret;

	@Value("${jwt.expiry-ms}")
	private long expiryMs;

	private SecretKey getKey() {
		return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
	}

	public String generateToken(User user) {
		Map<String, Object> claims = new HashMap<>();
		claims.put("email", user.getEmail());
		claims.put("role", user.getRole());
		claims.put("name", user.getFullName());

		return Jwts.builder()
				.claims(claims)
				.subject(String.valueOf(user.getId()))
				.issuedAt(new Date())
				.expiration(new Date(System.currentTimeMillis() + expiryMs))
				.signWith(getKey())
				.compact();
	}

	public Claims getClaims(String token) {
		return Jwts.parser()
				.verifyWith(getKey())
				.build()
				.parseSignedClaims(token)
				.getPayload();
	}

	public long getExpiryMs() {
		return expiryMs;
	}
}
