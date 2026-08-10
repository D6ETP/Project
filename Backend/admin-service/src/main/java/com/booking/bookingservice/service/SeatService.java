package com.booking.bookingservice.service;

import com.booking.bookingservice.entity.Seat;
import com.booking.bookingservice.repository.SeatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SeatService {

    @Autowired
    private SeatRepository seatRepository;

    public List<Seat> getSeatsBySchedule(Long scheduleId) {
        return seatRepository.findByScheduleId(scheduleId);
    }

    public List<Seat> getAvailableSeats(Long scheduleId) {
        return seatRepository.findByScheduleIdAndStatus(scheduleId, "AVAILABLE");
    }
}
