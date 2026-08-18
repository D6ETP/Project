package com.booking.bookingservice.client;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
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

    @CircuitBreaker(name = "notificationService", fallbackMethod = "fallbackSendTicketEmail")
    public void sendTicketEmail(String email, List<Map<String, Object>> bookingMaps) {
        Map<String, Object> event = new HashMap<>();
        event.put("email", email);
        event.put("bookings", bookingMaps);
        restTemplate.postForEntity(notificationServiceUrl + "/send-ticket", event, Map.class);
        log.info("[Booking -> Notification REST] Sent ticket PDF email to: {}", email);
    }

    public void fallbackSendTicketEmail(String email, List<Map<String, Object>> bookingMaps, Throwable t) {
        log.error("[BookingClient CB OPEN] Ticket email skipped for {}. Notification service unavailable. Cause: {}",
                email, t.getMessage());
    }

    @CircuitBreaker(name = "notificationService", fallbackMethod = "fallbackSendCancellationEmail")
    public void sendCancellationEmail(Map<String, Object> cancelEvent) {
        restTemplate.postForEntity(notificationServiceUrl + "/send-cancellation", cancelEvent, Map.class);
        log.info("[Booking -> Notification REST] Sent cancellation email to: {}", cancelEvent.get("email"));
    }

    public void fallbackSendCancellationEmail(Map<String, Object> cancelEvent, Throwable t) {
        log.error("[BookingClient CB OPEN] Cancellation email skipped for {}. Notification service unavailable. Cause: {}",
                cancelEvent.get("email"), t.getMessage());
    }
}
