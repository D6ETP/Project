package com.booking.authservice.client;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class NotificationClient {

    private static final Logger log = LoggerFactory.getLogger(NotificationClient.class);

    private final RestTemplate restTemplate;

    @Value("${notification.service.url:http://notification-service/api/notifications}")
    private String notificationServiceUrl;

    @Autowired
    public NotificationClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @CircuitBreaker(name = "notificationService", fallbackMethod = "fallbackSendRegistrationOtp")
    public void sendRegistrationOtp(String email, String otp) {
        Map<String, String> payload = Map.of("email", email, "otp", otp);
        restTemplate.postForEntity(notificationServiceUrl + "/send-otp", payload, Map.class);
        log.info("[Auth -> Notification REST] Triggered Registration OTP email for: {}", email);
    }

    public void fallbackSendRegistrationOtp(String email, String otp, Throwable t) {
        log.error("[NotificationClient CB OPEN] Registration OTP email skipped for: {}. Notification service unavailable. Cause: {}",
                email, t.getMessage());
    }

    @CircuitBreaker(name = "notificationService", fallbackMethod = "fallbackSendWelcomeEmail")
    public void sendWelcomeEmail(String email, String fullName) {
        Map<String, String> payload = Map.of(
                "email", email,
                "fullName", fullName != null ? fullName : "Traveler");
        restTemplate.postForEntity(notificationServiceUrl + "/send-welcome", payload, Map.class);
        log.info("[Auth -> Notification REST] Triggered Welcome email for: {}", email);
    }

    public void fallbackSendWelcomeEmail(String email, String fullName, Throwable t) {
        log.error("[NotificationClient CB OPEN] Welcome email skipped for: {}. Notification service unavailable. Cause: {}",
                email, t.getMessage());
    }

    @CircuitBreaker(name = "notificationService", fallbackMethod = "fallbackSendPasswordResetOtp")
    public void sendPasswordResetOtp(String email, String otp) {
        Map<String, String> payload = Map.of("email", email, "otp", otp);
        restTemplate.postForEntity(notificationServiceUrl + "/send-reset-otp", payload, Map.class);
        log.info("[Auth -> Notification REST] Triggered Password Reset OTP email for: {}", email);
    }

    public void fallbackSendPasswordResetOtp(String email, String otp, Throwable t) {
        log.error("[NotificationClient CB OPEN] Password Reset OTP skipped for: {}. Notification service unavailable. Cause: {}",
                email, t.getMessage());
    }

    @CircuitBreaker(name = "notificationService", fallbackMethod = "fallbackSendPasswordResetSuccess")
    public void sendPasswordResetSuccess(String email) {
        Map<String, String> payload = Map.of("email", email);
        restTemplate.postForEntity(notificationServiceUrl + "/send-reset-success", payload, Map.class);
        log.info("[Auth -> Notification REST] Triggered Password Reset Success email for: {}", email);
    }

    public void fallbackSendPasswordResetSuccess(String email, Throwable t) {
        log.error("[NotificationClient CB OPEN] Password Reset Success email skipped for: {}. Notification service unavailable. Cause: {}",
                email, t.getMessage());
    }
}
