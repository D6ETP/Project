package com.travel.authservice.util;

import java.util.Date;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    // Minimum 32 characters required for HS256
    private static final String SECRET_KEY =
            "mysecretkeymysecretkeymysecretkey123456";

    private static final SecretKey key =
            Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

    // Token validity: 24 hours
    private static final long JWT_EXPIRATION = 1000 * 60 * 60 * 24;

    // Generate JWT Token
    public String generateToken(String email) {

        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION))
                .signWith(key)
                .compact();
    }

    // Extract Email (Subject)
    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // Extract Username (same as Email)
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // Extract Any Claim
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {

        Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // Extract All Claims
    private Claims extractAllClaims(String token) {

        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // Validate JWT Token
    public boolean isTokenValid(String token) {

        try {

            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);

            return true;

        } catch (Exception e) {

            return false;
        }
    }
}