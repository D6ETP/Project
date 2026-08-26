package com.booking.bookingservice.service;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger log = LoggerFactory.getLogger(WalletClient.class);

    @Autowired
    private RestTemplate restTemplate;

    // auth-service is the eureka name
    private static final String AUTH_SERVICE_URL = "http://auth-service/auth/wallet";

    @CircuitBreaker(name = "walletService", fallbackMethod = "fallbackAddMoney")
    public void addMoney(Long userId, Double amount) {
        if (amount == null || amount <= 0) {
            log.info("Refund amount is 0 ({}). Skipping wallet credit call for user {}", amount, userId);
            return;
        }

        double safeAmount = Math.round(amount * 100.0) / 100.0;
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-User-Id", String.valueOf(userId));

        Map<String, Object> body = new HashMap<>();
        body.put("userId", userId);
        body.put("amount", safeAmount);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        restTemplate.postForEntity(AUTH_SERVICE_URL + "/add", request, Map.class);
        log.info("Wallet refunded/credited successfully for user: {}, amount: {}", userId, safeAmount);
    }

    /**
     * Fallback for addMoney — logs the failure but does NOT throw so that booking cancellation
     * still completes. The refund can be retried via an admin reconciliation job.
     */
    public void fallbackAddMoney(Long userId, Double amount, Throwable t) {
        log.error("[WalletClient CB OPEN] Failed to add {} to wallet for user {}. Will require manual reconciliation. Cause: {}",
                amount, userId, t.getMessage());
        // Non-blocking fallback: booking cancellation still succeeds; refund is deferred
    }

    @CircuitBreaker(name = "walletService", fallbackMethod = "fallbackDeductMoney")
    public void deductMoney(Long userId, Double amount) {
        if (amount == null || amount <= 0) {
            return;
        }

        double safeAmount = Math.round(amount * 100.0) / 100.0;
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-User-Id", String.valueOf(userId));

        Map<String, Object> body = new HashMap<>();
        body.put("userId", userId);
        body.put("amount", safeAmount);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        restTemplate.postForEntity(AUTH_SERVICE_URL + "/deduct", request, Map.class);
        log.info("Wallet deducted successfully for user: {}, amount: {}", userId, safeAmount);
    }

    /**
     * Fallback for deductMoney — throws so that the booking is rolled back.
     * We must NOT let a booking go through without successful payment deduction.
     */
    public void fallbackDeductMoney(Long userId, Double amount, Throwable t) {
        log.error("[WalletClient CB OPEN] Wallet service unavailable or insufficient balance. Cannot deduct {} for user {}. Cause: {}",
                amount, userId, t.getMessage());
        throw new RuntimeException("Wallet transaction failed or insufficient balance. Please verify your wallet balance.");
    }
}
