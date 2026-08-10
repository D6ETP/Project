package com.booking.bookingservice.controller;

import com.booking.bookingservice.entity.Driver;
import com.booking.bookingservice.repository.DriverRepository;
import com.booking.bookingservice.entity.Bus;
import com.booking.bookingservice.entity.Route;
import com.booking.bookingservice.entity.Schedule;
import com.booking.bookingservice.entity.Seat;
import com.booking.bookingservice.repository.BusRepository;
import com.booking.bookingservice.repository.RouteRepository;
import com.booking.bookingservice.repository.ScheduleRepository;
import com.booking.bookingservice.repository.SeatRepository;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminScheduleController {

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private RouteRepository routeRepository;

    @Autowired
    private BusRepository busRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private DriverRepository driverRepository;

    private static final String INDIAN_DL_PATTERN = "^[A-Z]{2}[0-9]{2}[ -]?[0-9]{4}[ -]?[0-9]{7}$";

    // GET /api/admin/drivers — see all drivers
    @GetMapping("/drivers")
    public ResponseEntity<List<Driver>> getAllDrivers(
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        return ResponseEntity.ok(driverRepository.findAll());
    }

    // POST /api/admin/drivers — register a new driver
    @PostMapping("/drivers")
    public ResponseEntity<?> createDriver(
            @RequestBody Driver driver,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        if (role != null && !role.isEmpty() && !"ROLE_ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admins only");
        }
        if (driver.getPhone() != null && driverRepository.findByPhone(driver.getPhone()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Driver with phone " + driver.getPhone() + " already exists.");
        }
        if (driver.getLicenseNumber() == null || !driver.getLicenseNumber().trim().toUpperCase().matches(INDIAN_DL_PATTERN)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Invalid Indian Driver License Number. Standard format example: MH12 2020 0012345 or MH1220200012345.");
        }
        driver.setLicenseNumber(driver.getLicenseNumber().trim().toUpperCase());
        if (driver.getActive() == null) {
            driver.setActive(true);
        }
        Driver saved = driverRepository.save(driver);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // PUT /api/admin/drivers/{id}/toggle-status — toggle active/deactivated
    @PutMapping("/drivers/{id}/toggle-status")
    public ResponseEntity<?> toggleDriverStatus(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        if (role != null && !role.isEmpty() && !"ROLE_ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admins only");
        }
        Driver driver = driverRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Driver not found with id: " + id));
        driver.setActive(driver.getActive() == null || !driver.getActive());
        Driver saved = driverRepository.save(driver);
        return ResponseEntity.ok(saved);
    }

    // GET /api/admin/schedules — see all schedules
    @GetMapping("/schedules")
    public ResponseEntity<List<Schedule>> getAllSchedules(
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        if (role != null && !role.isEmpty() && !"ROLE_ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(scheduleRepository.findAll());
    }

    // POST /api/admin/schedules — admin assigns a bus to a route at a time
    // This also auto-creates all the seat records for this trip!
    @PostMapping("/schedules")
    @Transactional
    public ResponseEntity<?> createSchedule(
            @RequestBody ScheduleRequest request,
            @RequestHeader(value = "X-User-Role", required = false) String role) {

        if (role != null && !role.isEmpty() && !"ROLE_ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admins only");
        }

        // fetch route and bus from DB
        Route route = routeRepository.findById(request.getRouteId())
            .orElseThrow(() -> new RuntimeException("Route not found with id: " + request.getRouteId()));

        Bus bus = busRepository.findById(request.getBusId())
            .orElseThrow(() -> new RuntimeException("Bus not found with id: " + request.getBusId()));

        if (Boolean.FALSE.equals(bus.getActive())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Cannot create schedule: Bus " + bus.getBusNumber() + " is currently DEACTIVATED.");
        }

        // Check for schedule conflicts for this bus
        List<Schedule> conflicts = scheduleRepository.findConflictingSchedules(
            bus.getId(),
            request.getDepartureTime(),
            request.getArrivalTime(),
            null
        );

        if (!conflicts.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body("Bus " + bus.getBusNumber() + " is already scheduled for another trip during this time period.");
        }

        // Handle normalized Driver assignment
        Driver driver = null;
        if (request.getDriverId() != null) {
            driver = driverRepository.findById(request.getDriverId()).orElse(null);
        }
        if (driver == null && request.getDriverPhone() != null && !request.getDriverPhone().trim().isEmpty()) {
            String phone = request.getDriverPhone().trim();
            String name = request.getDriverName() != null && !request.getDriverName().trim().isEmpty() ? request.getDriverName().trim() : "Ramesh Kumar";
            driver = driverRepository.findByPhone(phone).orElseGet(() -> {
                Driver newD = new Driver();
                newD.setFullName(name);
                newD.setPhone(phone);
                newD.setLicenseNumber("MH12 2020 0012345");
                newD.setActive(true);
                return driverRepository.save(newD);
            });
        }

        if (driver != null && Boolean.FALSE.equals(driver.getActive())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Cannot create schedule: Driver " + driver.getFullName() + " is currently DEACTIVATED.");
        }


        // Check for schedule conflicts for this driver
        if (driver != null) {
            List<Schedule> driverConflicts = scheduleRepository.findConflictingDriverSchedules(
                driver.getId(),
                request.getDepartureTime(),
                request.getArrivalTime(),
                null
            );

            if (!driverConflicts.isEmpty()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Driver " + driver.getFullName() + " is already assigned to another scheduled trip during this time period.");
            }
        }

        // create the schedule
        Schedule schedule = new Schedule();
        schedule.setRoute(route);
        schedule.setBus(bus);
        schedule.setDriver(driver);
        schedule.setDepartureTime(request.getDepartureTime());
        schedule.setArrivalTime(request.getArrivalTime());
        schedule.setAvailableSeats(bus.getTotalSeats()); // starts fully available
        schedule.setStatus("SCHEDULED");
        schedule.setIsAC(request.getIsAC());
        schedule.setIsSleeper(request.getIsSleeper());
        schedule.setHasWifi(request.getHasWifi());

        // Dynamic Pricing Logic: Weekend surge pricing
        Double finalPrice = request.getPriceForThisTrip();
        if (finalPrice == null) {
            finalPrice = route.getBasePrice();
            java.time.DayOfWeek day = request.getDepartureTime().getDayOfWeek();
            if (day == java.time.DayOfWeek.FRIDAY || day == java.time.DayOfWeek.SATURDAY || day == java.time.DayOfWeek.SUNDAY) {
                finalPrice = finalPrice * 1.20; // 20% weekend surge
            }
        }
        schedule.setPriceForThisTrip(finalPrice);

        Schedule savedSchedule = scheduleRepository.save(schedule);

        // auto-create seat records for every seat on this bus
        // so passengers can pick A1, A2, B1 etc from the seat map
        List<Seat> seats = new ArrayList<>();
        int totalSeats = bus.getTotalSeats();
        int rows = (totalSeats / 4);   // 4 seats per row (A, B, C, D columns)
        int extra = totalSeats % 4;

        for (int r = 1; r <= rows; r++) {
            for (char col : new char[]{'A', 'B', 'C', 'D'}) {
                Seat seat = new Seat();
                seat.setSchedule(savedSchedule);
                seat.setSeatNumber(r + "" + col);   // e.g. 1A, 1B, 2A...
                seat.setStatus("AVAILABLE");
                seats.add(seat);
            }
        }
        // handle remaining seats if bus doesn't divide perfectly into rows of 4
        for (int e = 1; e <= extra; e++) {
            Seat seat = new Seat();
            seat.setSchedule(savedSchedule);
            seat.setSeatNumber((rows + 1) + "" + (char)('A' + e - 1));
            seat.setStatus("AVAILABLE");
            seats.add(seat);
        }

        seatRepository.saveAll(seats);

        return ResponseEntity.status(HttpStatus.CREATED)
            .body("Schedule created with ID " + savedSchedule.getId() +
                  " and " + seats.size() + " seats generated");
    }

    // Simple inner DTO class to receive the POST body
    // Keeping it here for simplicity — you can move it to dto package later
    @Data
    static class ScheduleRequest {
        private Long routeId;
        private Long busId;
        private Long driverId;
        private LocalDateTime departureTime;
        private LocalDateTime arrivalTime;
        private Double priceForThisTrip;
        private Boolean isAC = false;
        private Boolean isSleeper = false;
        private Boolean hasWifi = false;
        private String driverName;
        private String driverPhone;
    }
}