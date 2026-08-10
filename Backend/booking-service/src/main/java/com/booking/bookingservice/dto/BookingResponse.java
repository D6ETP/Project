package com.booking.bookingservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse implements java.io.Serializable {
    private static final long serialVersionUID = 1L;

    private Long bookingId;
    private String bookingReference;
    private Long scheduleId;
    private Long busId;
    private String status;
    private String seatNumber;
    private String source;
    private String destination;
    private LocalDateTime departureTime;
    private Double amountPaid;
    private LocalDateTime bookedAt;

    private String passengerName;
    private Integer passengerAge;
    private String passengerGender;

    private String boardingPoint;
    private String droppingPoint;
}
