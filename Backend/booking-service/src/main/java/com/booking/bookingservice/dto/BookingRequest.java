package com.booking.bookingservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BookingRequest {

    @NotNull(message = "Schedule ID is required")
    private Long scheduleId;

    @NotNull(message = "Seat ID is required")
    private Long seatId;
}
