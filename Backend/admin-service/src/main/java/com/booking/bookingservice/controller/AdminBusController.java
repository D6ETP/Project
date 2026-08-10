package com.booking.bookingservice.controller;

import com.booking.bookingservice.entity.Bus;
import com.booking.bookingservice.service.BusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/admin/buses")
public class AdminBusController {

    @Autowired
    private BusService busService;

    private static final String INDIAN_BUS_PATTERN = "^([A-Z]{2}[ -]?[0-9]{2}[ -]?[A-Z]{1,3}[ -]?[0-9]{4})|([0-9]{2}[ -]?BH[ -]?[0-9]{4}[ -]?[A-Z]{1,2})$";

    @PostMapping
    public ResponseEntity<?> addBus(@RequestBody Bus bus, @RequestHeader(value = "X-User-Role", required = false) String role) {
        if (role != null && !role.isEmpty() && !"ROLE_ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Admins can add buses");
        }
        if (bus.getBusNumber() == null || !bus.getBusNumber().trim().toUpperCase().matches(INDIAN_BUS_PATTERN)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Invalid Indian Bus Registration Number. Example valid formats: MH 12 AB 1234, MH-12-CD-5678, or 22 BH 1234 AA.");
        }
        bus.setBusNumber(bus.getBusNumber().trim().toUpperCase());
        if (bus.getActive() == null) {
            bus.setActive(true);
        }
        return ResponseEntity.ok(busService.addBus(bus));
    }

    @GetMapping
    public ResponseEntity<List<Bus>> getAllBuses() {
        return ResponseEntity.ok(busService.getAllBuses());
    }

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<?> toggleBusStatus(@PathVariable Long id, @RequestHeader(value = "X-User-Role", required = false) String role) {
        if (role != null && !role.isEmpty() && !"ROLE_ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only Admins can toggle bus status");
        }
        try {
            Bus updated = busService.toggleBusStatus(id);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}

