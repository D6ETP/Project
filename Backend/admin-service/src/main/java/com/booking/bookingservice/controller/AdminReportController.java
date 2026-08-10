package com.booking.bookingservice.controller;

import com.booking.bookingservice.entity.Booking;
import com.booking.bookingservice.repository.BookingRepository;
import com.booking.bookingservice.repository.ScheduleRepository;
import com.booking.bookingservice.repository.BusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/reports")
public class AdminReportController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private BusRepository busRepository;

    // GET /api/admin/reports — returns booking summary statistics with optional date filtering
    @GetMapping
    public ResponseEntity<?> getSummary(
            @RequestParam(value = "days", required = false, defaultValue = "0") int days,
            @RequestHeader(value = "X-User-Role", required = false) String role) {

        if (role != null && !role.isEmpty() && !"ROLE_ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admins only");
        }

        List<Booking> allBookings = bookingRepository.findAll();

        if (days > 0) {
            java.time.LocalDateTime cutoff = java.time.LocalDateTime.now().minusDays(days);
            allBookings = allBookings.stream()
                .filter(b -> b.getBookedAt() != null && b.getBookedAt().isAfter(cutoff))
                .collect(Collectors.toList());
        }

        long totalBookings   = allBookings.size();
        long confirmed       = allBookings.stream().filter(b -> "CONFIRMED".equalsIgnoreCase(b.getStatus())).count();
        long cancelled       = allBookings.stream().filter(b -> "CANCELLED".equalsIgnoreCase(b.getStatus())).count();
        double totalRevenue  = allBookings.stream()
                                .filter(b -> "CONFIRMED".equalsIgnoreCase(b.getStatus()))
                                .mapToDouble(b -> b.getAmountPaid() != null ? b.getAmountPaid() : 0)
                                .sum();

        // Top routes by booking count
        Map<String, Long> routeCount = allBookings.stream()
            .filter(b -> b.getSchedule() != null && b.getSchedule().getRoute() != null)
            .collect(Collectors.groupingBy(
                b -> b.getSchedule().getRoute().getSource() + " \u2192 " + b.getSchedule().getRoute().getDestination(),
                Collectors.counting()
            ));

        List<Map<String, Object>> topRoutes = routeCount.entrySet().stream()
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
            .limit(5)
            .map(e -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("route", e.getKey());
                m.put("bookings", e.getValue());
                return m;
            })
            .collect(Collectors.toList());

        long totalBuses     = busRepository.count();
        long totalSchedules = scheduleRepository.count();

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("totalBookings",   totalBookings);
        report.put("confirmedCount",  confirmed);
        report.put("cancelledCount",  cancelled);
        report.put("totalRevenue",    Math.round(totalRevenue * 100.0) / 100.0);
        report.put("totalBuses",      totalBuses);
        report.put("totalSchedules",  totalSchedules);
        report.put("topRoutes",       topRoutes);
        report.put("filterDays",      days);

        return ResponseEntity.ok(report);
    }

    // GET /api/admin/reports/occupancy — returns average occupancy per schedule
    @GetMapping("/occupancy")
    public ResponseEntity<?> getOccupancyReport(
            @RequestHeader(value = "X-User-Role", required = false) String role) {

        if (role != null && !role.isEmpty() && !"ROLE_ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admins only");
        }

        List<com.booking.bookingservice.entity.Schedule> allSchedules = scheduleRepository.findAll();
        List<Map<String, Object>> occupancyList = new ArrayList<>();

        for (com.booking.bookingservice.entity.Schedule s : allSchedules) {
            int total = s.getBus().getTotalSeats();
            int available = s.getAvailableSeats();
            int booked = total - available;
            double occupancyRate = total > 0 ? (double) booked / total * 100 : 0;

            Map<String, Object> map = new LinkedHashMap<>();
            map.put("scheduleId", s.getId());
            map.put("route", s.getRoute().getSource() + " \u2192 " + s.getRoute().getDestination());
            map.put("departure", s.getDepartureTime());
            map.put("totalSeats", total);
            map.put("bookedSeats", booked);
            map.put("occupancyRate", Math.round(occupancyRate * 100.0) / 100.0);

            occupancyList.add(map);
        }

        return ResponseEntity.ok(occupancyList);
    }

    /**
     * GET /api/admin/reports/bus-passenger-list?busNumber=MH-12-AB-1234
     * Returns all CONFIRMED passengers for a given bus, grouped by schedule.
     * Used to generate the driver/helper PDF passenger roster.
     */
    @GetMapping("/bus-passenger-list")
    public ResponseEntity<?> getBusPassengerList(
            @RequestParam("busNumber") String busNumber,
            @RequestParam(value = "date", required = false) String dateStr,
            @RequestHeader(value = "X-User-Role", required = false) String role) {

        if (!"ROLE_ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admins only");
        }

        List<Booking> bookings = bookingRepository.findConfirmedBookingsByBusNumber(busNumber.trim().toUpperCase());

        if (dateStr != null && !dateStr.trim().isEmpty()) {
            try {
                java.time.LocalDate targetDate = java.time.LocalDate.parse(dateStr.trim());
                bookings = bookings.stream()
                    .filter(b -> b.getSchedule() != null && b.getSchedule().getDepartureTime() != null
                        && b.getSchedule().getDepartureTime().toLocalDate().equals(targetDate))
                    .collect(Collectors.toList());
            } catch (Exception e) {
                // Ignore parse exception, proceed with all bookings
            }
        }

        if (bookings.isEmpty()) {
            Map<String, Object> empty = new LinkedHashMap<>();
            empty.put("busNumber", busNumber.toUpperCase());
            empty.put("totalPassengers", 0);
            empty.put("schedules", Collections.emptyList());
            return ResponseEntity.ok(empty);
        }

        // Group by schedule preserving departure-time order
        Map<Long, List<Booking>> bySchedule = bookings.stream()
            .collect(Collectors.groupingBy(b -> b.getSchedule().getId(), LinkedHashMap::new, Collectors.toList()));

        List<Map<String, Object>> scheduleList = new ArrayList<>();
        for (Map.Entry<Long, List<Booking>> entry : bySchedule.entrySet()) {
            List<Booking> schedBookings = entry.getValue();
            Booking first = schedBookings.get(0);
            com.booking.bookingservice.entity.Schedule s = first.getSchedule();

            Map<String, Object> scheduleMap = new LinkedHashMap<>();
            scheduleMap.put("scheduleId",  s.getId());
            scheduleMap.put("route",       s.getRoute().getSource() + " \u2192 " + s.getRoute().getDestination());
            scheduleMap.put("departure",   s.getDepartureTime()  != null ? s.getDepartureTime().toString()  : "");
            scheduleMap.put("arrival",     s.getArrivalTime()    != null ? s.getArrivalTime().toString()    : "");
            scheduleMap.put("driverName",  s.getDriverName());
            scheduleMap.put("driverPhone", s.getDriverPhone());
            scheduleMap.put("busType",     s.getBus().getBusType());
            scheduleMap.put("totalSeats",  s.getBus().getTotalSeats());
            scheduleMap.put("bookedCount", schedBookings.size());

            List<Map<String, Object>> passengers = schedBookings.stream().map(b -> {
                Map<String, Object> p = new LinkedHashMap<>();
                p.put("bookingRef",      b.getBookingReference());
                p.put("seatNumber",      b.getSeat()            != null ? b.getSeat().getSeatNumber()  : "-");
                p.put("passengerName",   b.getPassengerName()   != null ? b.getPassengerName()         : "N/A");
                p.put("passengerAge",    b.getPassengerAge()    != null ? b.getPassengerAge().toString(): "-");
                p.put("passengerGender", b.getPassengerGender() != null ? b.getPassengerGender()       : "-");
                p.put("contactPhone",    b.getContactPhone()    != null ? b.getContactPhone()           : "-");
                p.put("contactEmail",    b.getContactEmail()    != null ? b.getContactEmail()           : "-");
                p.put("amountPaid",      b.getAmountPaid()      != null ? b.getAmountPaid()             : 0);
                p.put("bookedAt",        b.getBookedAt()        != null ? b.getBookedAt().toString()    : "");
                return p;
            }).collect(Collectors.toList());

            scheduleMap.put("passengers", passengers);
            scheduleList.add(scheduleMap);
        }

        // Build top-level bus info
        com.booking.bookingservice.entity.Bus bus = bookings.get(0).getSchedule().getBus();
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("busNumber",       bus.getBusNumber());
        result.put("operatorName",    bus.getOperatorName());
        result.put("busType",         bus.getBusType());
        result.put("totalSeats",      bus.getTotalSeats());
        result.put("totalPassengers", bookings.size());
        result.put("generatedAt",     java.time.LocalDateTime.now().toString());
        result.put("schedules",       scheduleList);

        return ResponseEntity.ok(result);
    }
}
