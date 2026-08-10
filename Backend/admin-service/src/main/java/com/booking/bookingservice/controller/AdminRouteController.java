package com.booking.bookingservice.controller;

import com.booking.bookingservice.entity.Route;
import com.booking.bookingservice.repository.RouteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/routes")
public class AdminRouteController {

    @Autowired
    private RouteRepository routeRepository;

    // GET /api/admin/routes — see all routes (including inactive)
    @GetMapping
    public ResponseEntity<List<Route>> getAllRoutes(
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        if (role != null && !role.isEmpty() && !"ROLE_ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(routeRepository.findAll());
    }

    // POST /api/admin/routes — admin adds a new route like Pune → Mumbai
    @PostMapping
    public ResponseEntity<?> addRoute(
            @RequestBody Route route,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        if (role != null && !role.isEmpty() && !"ROLE_ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admins only");
        }
        if (route.getActive() == null) {
            route.setActive(true);
        }
        Route saved = routeRepository.save(route);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // PUT /api/admin/routes/{id}/toggle-status — toggle active/inactive
    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<?> toggleRouteStatus(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        if (role != null && !role.isEmpty() && !"ROLE_ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admins only");
        }
        Route route = routeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Route not found with id: " + id));
        route.setActive(route.getActive() == null || !route.getActive());
        routeRepository.save(route);
        return ResponseEntity.ok(route);
    }
}
