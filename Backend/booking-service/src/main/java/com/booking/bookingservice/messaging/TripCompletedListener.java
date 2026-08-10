package com.booking.bookingservice.messaging;

import com.booking.bookingservice.entity.Booking;
import com.booking.bookingservice.entity.Bus;
import com.booking.bookingservice.entity.Route;
import com.booking.bookingservice.entity.Schedule;
import com.booking.bookingservice.entity.Seat;
import com.booking.bookingservice.repository.BookingRepository;
import com.booking.bookingservice.repository.BusRepository;
import com.booking.bookingservice.repository.RouteRepository;
import com.booking.bookingservice.repository.ScheduleRepository;
import com.booking.bookingservice.repository.SeatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
public class TripCompletedListener {

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private RouteRepository routeRepository;

    @Autowired
    private BusRepository busRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @PostMapping("/trip-completed")
    @Transactional
    public ResponseEntity<?> handleTripCompleted(@RequestBody Map<String, Object> event) {
        try {
            System.out.println("📨 Received trip completed REST event: " + event);

            Long scheduleId = Long.valueOf(event.get("scheduleId").toString());
            String returnSource = event.get("destination").toString();
            String returnDestination = event.get("source").toString();

            Schedule originalSchedule = scheduleRepository.findById(scheduleId).orElse(null);

            if (originalSchedule == null) {
                System.out.println("⚠️ Schedule not found for id: " + scheduleId + " — skipping");
                return ResponseEntity.badRequest().body(Map.of("message", "Schedule not found"));
            }

            originalSchedule.setStatus("COMPLETED");
            scheduleRepository.save(originalSchedule);

            List<Route> returnRoutes = routeRepository
                .findBySourceIgnoreCaseAndDestinationIgnoreCaseAndActiveTrue(
                    returnSource, returnDestination
                );

            if (returnRoutes.isEmpty()) {
                System.out.println("⚠️ No return route found for "
                    + returnSource + " → " + returnDestination
                    + ". Skipping seat generation.");
                return ResponseEntity.ok(Map.of("message", "Schedule completed. No return route found."));
            }

            Route returnRoute = returnRoutes.get(0);
            Bus bus = originalSchedule.getBus();

            LocalDateTime returnDeparture = originalSchedule.getArrivalTime() != null
                ? originalSchedule.getArrivalTime().plusHours(2)
                : LocalDateTime.now().plusHours(2);

            LocalDateTime returnArrival = returnDeparture
                .plusMinutes(getDurationMinutes(originalSchedule));

            Schedule returnSchedule = new Schedule();
            returnSchedule.setRoute(returnRoute);
            returnSchedule.setBus(bus);
            returnSchedule.setDepartureTime(returnDeparture);
            returnSchedule.setArrivalTime(returnArrival);
            returnSchedule.setAvailableSeats(bus.getTotalSeats());
            returnSchedule.setStatus("SCHEDULED");
            returnSchedule.setPriceForThisTrip(originalSchedule.getPriceForThisTrip());

            Schedule savedReturn = scheduleRepository.save(returnSchedule);

            List<Seat> seats = generateSeats(savedReturn, bus.getTotalSeats());
            seatRepository.saveAll(seats);

            System.out.println("✅ Return trip created: " + returnSource + " → " + returnDestination
                + " | Schedule ID: " + savedReturn.getId()
                + " | " + seats.size() + " seats generated");

            return ResponseEntity.ok(Map.of("message", "Trip completed and return schedule created successfully"));

        } catch (Exception e) {
            System.out.println("❌ Error processing trip completed event: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    private long getDurationMinutes(Schedule original) {
        if (original.getDepartureTime() != null && original.getArrivalTime() != null) {
            return java.time.Duration.between(
                original.getDepartureTime(), original.getArrivalTime()
            ).toMinutes();
        }
        return 180;
    }

    private List<Seat> generateSeats(Schedule schedule, int totalSeats) {
        List<Seat> seats = new ArrayList<>();
        int rows = totalSeats / 4;
        int extra = totalSeats % 4;

        for (int r = 1; r <= rows; r++) {
            for (char col : new char[]{'A', 'B', 'C', 'D'}) {
                Seat seat = new Seat();
                seat.setSchedule(schedule);
                seat.setSeatNumber(r + "" + col);
                seat.setStatus("AVAILABLE");
                seats.add(seat);
            }
        }
        for (int e = 1; e <= extra; e++) {
            Seat seat = new Seat();
            seat.setSchedule(schedule);
            seat.setSeatNumber((rows + 1) + "" + (char)('A' + e - 1));
            seat.setStatus("AVAILABLE");
            seats.add(seat);
        }
        return seats;
    }
}