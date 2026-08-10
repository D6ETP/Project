package com.booking.bookingservice.service;

import com.booking.bookingservice.entity.Schedule;
import com.booking.bookingservice.entity.Seat;
import com.booking.bookingservice.repository.ScheduleRepository;
import com.booking.bookingservice.repository.SeatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class SeatService {

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Transactional
    public List<Seat> getSeatsBySchedule(Long scheduleId) {
        if (scheduleId == null) {
            return createDummySeats(1L);
        }
        List<Seat> seats = seatRepository.findByScheduleId(scheduleId);
        if (seats.isEmpty()) {
            Schedule schedule = scheduleRepository.findById(scheduleId).orElse(null);
            if (schedule != null) {
                List<Seat> newSeats = new ArrayList<>();
                String[] rows = {"A", "B", "C", "D"};
                for (String row : rows) {
                    for (int i = 1; i <= 10; i++) {
                        Seat seat = new Seat();
                        seat.setSchedule(schedule);
                        seat.setSeatNumber(row + i);
                        seat.setStatus("AVAILABLE");
                        newSeats.add(seat);
                    }
                }
                return seatRepository.saveAll(newSeats);
            } else {
                return createDummySeats(scheduleId);
            }
        }
        return seats;
    }

    private List<Seat> createDummySeats(Long scheduleId) {
        List<Seat> seats = new ArrayList<>();
        String[] rows = {"A", "B", "C", "D"};
        long idCounter = 1;
        for (String row : rows) {
            for (int i = 1; i <= 10; i++) {
                Seat seat = new Seat();
                seat.setId(idCounter++);
                seat.setSeatNumber(row + i);
                seat.setStatus("AVAILABLE");
                seats.add(seat);
            }
        }
        return seats;
    }

    public List<Seat> getAvailableSeats(Long scheduleId) {
        return seatRepository.findByScheduleIdAndStatus(scheduleId, "AVAILABLE");
    }
}
