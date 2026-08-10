package com.booking.gateway.util;

import java.nio.charset.StandardCharsets;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String getUserId(String token) {
        // userId is stored as the JWT subject (not a separate claim)
        String userId = extractAllClaims(token).getSubject();
        System.out.println("[Gateway] userId from token: " + userId);
        return userId;
    }

    public String getRole(String token) {
        String role = extractAllClaims(token).get("role", String.class);
        System.out.println("[Gateway] role from token: " + role);
        return role;
    }

    public String getEmail(String token) {
        return extractAllClaims(token)
                .get("email", String.class);
    }
}