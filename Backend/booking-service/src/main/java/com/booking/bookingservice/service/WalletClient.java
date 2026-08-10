package com.booking.bookingservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class WalletClient {

    @Autowired
    private RestTemplate restTemplate;

    // auth-service is the eureka name
    private final String AUTH_SERVICE_URL = "http://auth-service/auth/wallet";

    public void addMoney(Long userId, Double amount) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-User-Id", String.valueOf(userId));

        Map<String, Double> body = new HashMap<>();
        body.put("amount", amount);

        HttpEntity<Map<String, Double>> request = new HttpEntity<>(body, headers);
        
        try {
            restTemplate.postForEntity(AUTH_SERVICE_URL + "/add", request, Map.class);
            System.out.println("Wallet refunded successfully for user: " + userId + ", amount: " + amount);
        } catch (Exception e) {
            System.err.println("Failed to add money to wallet: " + e.getMessage());
            throw new RuntimeException("Failed to add money to wallet. Please try again.");
        }
    }

    public void deductMoney(Long userId, Double amount) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-User-Id", String.valueOf(userId));

        Map<String, Double> body = new HashMap<>();
        body.put("amount", amount);

        HttpEntity<Map<String, Double>> request = new HttpEntity<>(body, headers);
        
        try {
            restTemplate.postForEntity(AUTH_SERVICE_URL + "/deduct", request, Map.class);
            System.out.println("Wallet deducted successfully for user: " + userId + ", amount: " + amount);
        } catch (Exception e) {
            System.err.println("Failed to deduct money from wallet: " + e.getMessage());
            throw new RuntimeException("Insufficient wallet balance or service unavailable.");
        }
    }
}
