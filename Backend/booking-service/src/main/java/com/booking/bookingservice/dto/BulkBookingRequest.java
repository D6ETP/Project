package com.booking.bookingservice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class BulkBookingRequest {

    @NotNull(message = "Schedule ID is required")
    private Long scheduleId;

    @NotEmpty(message = "At least one passenger must be provided")
    @Valid
    private List<PassengerBookingRequest> passengers;

    @NotBlank(message = "Contact email is required")
    private String contactEmail;

    @NotBlank(message = "Contact phone is required")
    private String contactPhone;

    private String paymentMethod; // "wallet" or "external"

    private String boardingPoint;
    private String droppingPoint;
}
