package com.notification.notificationservice.client;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;

@Component
public class BookingServiceClient {

    private static final Logger log = LoggerFactory.getLogger(BookingServiceClient.class);

    @Autowired
    private RestTemplate restTemplate;

    /**
     * Fetches all distinct passenger contact emails for a given schedule.
     * Calls booking-service via Eureka service discovery.
     */
    @CircuitBreaker(name = "bookingService", fallbackMethod = "fallbackGetContactEmails")
    public List<String> getContactEmailsByScheduleId(Long scheduleId) {
        String url = "http://booking-service/bookings/internal/schedule/" + scheduleId + "/contact-emails";
        ResponseEntity<List<String>> response = restTemplate.exchange(
            url,
            HttpMethod.GET,
            null,
            new ParameterizedTypeReference<List<String>>() {}
        );
        List<String> emails = response.getBody();
        return emails != null ? emails : Collections.emptyList();
    }

    /**
     * Fallback: booking-service is down — return empty list so schedule notifications are skipped gracefully.
     */
    public List<String> fallbackGetContactEmails(Long scheduleId, Throwable t) {
        log.error("[BookingServiceClient CB OPEN] Could not fetch contact emails for scheduleId={}. Booking service unavailable. Cause: {}",
                scheduleId, t.getMessage());
        return Collections.emptyList();
    }
}
