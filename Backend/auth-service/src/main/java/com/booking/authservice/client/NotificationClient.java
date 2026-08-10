package com.booking.authservice.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class NotificationClient {

    private final RestTemplate restTemplate;

    @Value("${notification.service.url:http://localhost:8084/api/notifications}")
    private String notificationServiceUrl;

    public NotificationClient() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000); // 5 seconds connection timeout
        factory.setReadTimeout(5000); // 5 seconds read timeout
        this.restTemplate = new RestTemplate(factory);
    }

    public void sendRegistrationOtp(String email, String otp) {
        try {
            Map<String, String> payload = Map.of("email", email, "otp", otp);
            restTemplate.postForEntity(notificationServiceUrl + "/send-otp", payload, Map.class);
            System.out.println("✅ [Auth -> Notification REST] Triggered Registration OTP email for: " + email);
        } catch (Exception ex) {
            System.err.println("❌ [Auth -> Notification REST] Failed to send Registration OTP email to " + email + ": "
                    + ex.getMessage());
        }
    }

    public void sendWelcomeEmail(String email, String fullName) {
        try {
            Map<String, String> payload = Map.of(
                    "email", email,
                    "fullName", fullName != null ? fullName : "Traveler");
            restTemplate.postForEntity(notificationServiceUrl + "/send-welcome", payload, Map.class);
            System.out.println("✅ [Auth -> Notification REST] Triggered Welcome email for: " + email);
        } catch (Exception ex) {
            System.err.println(
                    "❌ [Auth -> Notification REST] Failed to send Welcome email to " + email + ": " + ex.getMessage());
        }
    }

    public void sendPasswordResetOtp(String email, String otp) {
        try {
            Map<String, String> payload = Map.of("email", email, "otp", otp);
            restTemplate.postForEntity(notificationServiceUrl + "/send-reset-otp", payload, Map.class);
            System.out.println("✅ [Auth -> Notification REST] Triggered Password Reset OTP email for: " + email);
        } catch (Exception ex) {
            System.err.println("❌ [Auth -> Notification REST] Failed to send Password Reset OTP email to " + email
                    + ": " + ex.getMessage());
        }
    }

    public void sendPasswordResetSuccess(String email) {
        try {
            Map<String, String> payload = Map.of("email", email);
            restTemplate.postForEntity(notificationServiceUrl + "/send-reset-success", payload, Map.class);
            System.out.println("✅ [Auth -> Notification REST] Triggered Password Reset Success email for: " + email);
        } catch (Exception ex) {
            System.err.println("❌ [Auth -> Notification REST] Failed to send Password Reset Success email to " + email
                    + ": " + ex.getMessage());
        }
    }
}
