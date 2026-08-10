package com.booking.bookingservice.service;

import com.booking.bookingservice.dto.BookingResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TicketEmailService {

    private final RestTemplate restTemplate;

    @Value("${notification.service.url:http://localhost:8084/api/notifications}")
    private String notificationServiceUrl;

    public TicketEmailService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(5000);
        this.restTemplate = new RestTemplate(factory);
    }

    public void sendTickets(String toEmail, List<BookingResponse> bookings) {
        if (bookings == null || bookings.isEmpty()) return;
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("email", toEmail);
            event.put("bookings", bookings);
            restTemplate.postForEntity(notificationServiceUrl + "/send-ticket", event, Map.class);
            System.out.println("✅ [Booking -> Notification REST] Triggered ticket email for: " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ [Booking -> Notification REST] Failed to send ticket email to " + toEmail + ": " + e.getMessage());
        }
    }

    public void sendPostTripThankYouEmail(String toEmail, String passengerName) {
        System.out.println("ℹ️ Post trip email handled centrally by notification-service");
    }
}
