package com.notification.notificationservice.client;

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

    @Autowired
    private RestTemplate restTemplate;

    /**
     * Fetches all distinct passenger contact emails for a given schedule.
     * Calls booking-service via Eureka service discovery.
     */
    public List<String> getContactEmailsByScheduleId(Long scheduleId) {
        try {
            String url = "http://booking-service/bookings/internal/schedule/" + scheduleId + "/contact-emails";
            ResponseEntity<List<String>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<String>>() {}
            );
            List<String> emails = response.getBody();
            return emails != null ? emails : Collections.emptyList();
        } catch (Exception e) {
            System.err.println("⚠️ Failed to fetch contact emails from booking-service for scheduleId=" + scheduleId + ": " + e.getMessage());
            return Collections.emptyList();
        }
    }
}
