package com.booking.bookingservice.service;

import com.booking.bookingservice.dto.ScheduleResponse;
import com.booking.bookingservice.entity.Route;
import com.booking.bookingservice.entity.Schedule;
import com.booking.bookingservice.repository.RouteRepository;
import com.booking.bookingservice.repository.ScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class RouteService {

    @Autowired
    private RouteRepository routeRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    public List<Route> getAllRoutes() {
        return routeRepository.findByActiveTrue();
    }

    @Cacheable(value = "schedules", key = "#source + '-' + #destination + '-' + #date.toString()")
    public List<ScheduleResponse> searchSchedules(String source, String destination, LocalDate date) {
        // find matching routes
        List<Route> routes = routeRepository
            .findBySourceIgnoreCaseAndDestinationIgnoreCaseAndActiveTrue(source, destination);

        if (routes.isEmpty()) {
            return new ArrayList<>();
        }

        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);

        List<ScheduleResponse> result = new ArrayList<>();

        for (Route route : routes) {
            List<Schedule> schedules = scheduleRepository
                .findAvailableSchedules(route.getId(), startOfDay, endOfDay);

            for (Schedule schedule : schedules) {
                ScheduleResponse dto = new ScheduleResponse();
                dto.setScheduleId(schedule.getId());
                dto.setSource(route.getSource());
                dto.setDestination(route.getDestination());
                dto.setDepartureTime(schedule.getDepartureTime());
                dto.setArrivalTime(schedule.getArrivalTime());
                dto.setAvailableSeats(schedule.getAvailableSeats());
                dto.setPrice(schedule.getPriceForThisTrip() != null
                    ? schedule.getPriceForThisTrip()
                    : route.getBasePrice());
                dto.setBusType(schedule.getBus().getBusType());
                dto.setBusNumber(schedule.getBus().getBusNumber());
                dto.setBusId(schedule.getBus().getId());
                dto.setOperatorName(schedule.getBus().getOperatorName() != null ? schedule.getBus().getOperatorName() : "EasyTravel Express");
                dto.setDriverName(schedule.getDriverName() != null ? schedule.getDriverName() : "Ramesh Kumar");
                dto.setDriverPhone(schedule.getDriverPhone() != null ? schedule.getDriverPhone() : "9876543210");

                result.add(dto);
            }
        }

        return result;
    }
}
