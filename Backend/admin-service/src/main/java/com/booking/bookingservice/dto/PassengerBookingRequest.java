package com.booking.bookingservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PassengerBookingRequest {

    @NotNull(message = "Seat ID is required")
    private Long seatId;

    @NotBlank(message = "Passenger name is required")
    private String passengerName;

    @NotNull(message = "Passenger age is required")
    private Integer passengerAge;

    @NotBlank(message = "Passenger gender is required")
    private String passengerGender;
}
