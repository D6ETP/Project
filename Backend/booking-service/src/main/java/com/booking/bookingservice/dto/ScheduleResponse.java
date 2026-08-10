package com.booking.bookingservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleResponse {

    private Long scheduleId;
    private String source;
    private String destination;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private Integer availableSeats;
    private Double price;
    private Boolean isAC;
    private Boolean isSleeper;
    private Boolean hasWifi;
    private String busType;
    private String busNumber;
    private Long busId;
    private String operatorName;
    private String operatorLogo;
    private String busImage;
    private Double averageRating;
    private Integer totalReviews;
    private String driverName;
    private String driverPhone;
}
