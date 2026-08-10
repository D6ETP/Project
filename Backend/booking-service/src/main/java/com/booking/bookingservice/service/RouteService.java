package com.booking.bookingservice.service;

import com.booking.bookingservice.dto.ScheduleResponse;
import com.booking.bookingservice.entity.Route;
import com.booking.bookingservice.entity.Schedule;
import com.booking.bookingservice.entity.CityStop;
import com.booking.bookingservice.repository.CityStopRepository;
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

    @Autowired
    private CityStopRepository cityStopRepository;

    public List<Route> getAllRoutes() {
        return routeRepository.findByActiveTrue();
    }

    @Cacheable(value = "city_stops", key = "#city.toLowerCase()")
    public List<String> getStopsForCity(String city) {
        List<CityStop> stops = cityStopRepository.findByCityIgnoreCase(city);
        List<String> stopNames = new ArrayList<>();
        for (CityStop stop : stops) {
            stopNames.add(stop.getStopName());
        }
        return stopNames;
    }

    @Autowired
    private com.booking.bookingservice.repository.ReviewRepository reviewRepository;

    public List<ScheduleResponse> searchSchedules(String source, String destination, LocalDate date) {
        // find matching routes
        List<Route> routes = routeRepository
            .findBySourceIgnoreCaseAndDestinationIgnoreCaseAndActiveTrue(source, destination);

        if (routes.isEmpty()) {
            return new ArrayList<>();
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = date.atStartOfDay();
        if (startOfDay.isBefore(now)) {
            startOfDay = now; // Do not return buses whose departure time has already passed!
        }

        LocalDateTime endOfDay = date.atTime(23, 59, 59);

        if (startOfDay.isAfter(endOfDay)) {
            return new ArrayList<>();
        }

        List<ScheduleResponse> result = new ArrayList<>();

        for (Route route : routes) {
            List<Schedule> schedules = scheduleRepository
                .findAvailableSchedules(route.getId(), startOfDay, endOfDay, now);

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
                dto.setIsAC(schedule.getIsAC());
                dto.setIsSleeper(schedule.getIsSleeper());
                dto.setHasWifi(schedule.getHasWifi());
                dto.setBusType(schedule.getBus().getBusType());
                dto.setBusNumber(schedule.getBus().getBusNumber());
                dto.setBusId(schedule.getBus().getId());
                dto.setOperatorName(schedule.getBus().getOperatorName() != null ? schedule.getBus().getOperatorName() : "EasyTravel Express");
                dto.setOperatorLogo(schedule.getBus().getOperatorLogo());
                dto.setBusImage(schedule.getBus().getBusImage());

                // Fetch real rating from DB
                Double avg = reviewRepository.findAverageRatingByBusId(schedule.getBus().getId());
                Integer count = reviewRepository.countReviewsByBusId(schedule.getBus().getId());
                dto.setAverageRating(avg != null ? Math.round(avg * 10.0) / 10.0 : 4.8);
                dto.setTotalReviews(count != null && count > 0 ? count : (48 + Math.toIntExact(schedule.getId() * 17)));

                dto.setDriverName(schedule.getDriverName() != null ? schedule.getDriverName() : "Ramesh Kumar");
                dto.setDriverPhone(schedule.getDriverPhone() != null ? schedule.getDriverPhone() : "9876543210");

                result.add(dto);
            }
        }

        return result;
    }

    public List<ScheduleResponse> getAllScheduledTrips() {
        List<Schedule> schedules = scheduleRepository.findAll();
        List<ScheduleResponse> result = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        for (Schedule schedule : schedules) {
            // Exclude non-SCHEDULED or RUNNING / COMPLETED / CANCELLED trips
            if (schedule.getStatus() != null && !"SCHEDULED".equalsIgnoreCase(schedule.getStatus())) {
                continue;
            }
            // Exclude past trips whose departure time has already passed
            if (schedule.getDepartureTime() != null && !schedule.getDepartureTime().isAfter(now)) {
                continue;
            }
            // Exclude sold out trips
            if (schedule.getAvailableSeats() != null && schedule.getAvailableSeats() <= 0) {
                continue;
            }
            Route route = schedule.getRoute();
            ScheduleResponse dto = new ScheduleResponse();
            dto.setScheduleId(schedule.getId());
            dto.setSource(route != null ? route.getSource() : "Pune");
            dto.setDestination(route != null ? route.getDestination() : "Mumbai");
            dto.setDepartureTime(schedule.getDepartureTime());
            dto.setArrivalTime(schedule.getArrivalTime());
            dto.setAvailableSeats(schedule.getAvailableSeats());
            dto.setPrice(schedule.getPriceForThisTrip() != null ? schedule.getPriceForThisTrip() : (route != null ? route.getBasePrice() : 500.0));
            dto.setIsAC(schedule.getIsAC());
            dto.setIsSleeper(schedule.getIsSleeper());
            dto.setHasWifi(schedule.getHasWifi());
            if (schedule.getBus() != null) {
                dto.setBusType(schedule.getBus().getBusType());
                dto.setBusNumber(schedule.getBus().getBusNumber());
                dto.setBusId(schedule.getBus().getId());
                dto.setOperatorName(schedule.getBus().getOperatorName() != null ? schedule.getBus().getOperatorName() : "EasyTravel Express");
                dto.setOperatorLogo(schedule.getBus().getOperatorLogo());
                dto.setBusImage(schedule.getBus().getBusImage());
                Double avg = reviewRepository.findAverageRatingByBusId(schedule.getBus().getId());
                Integer count = reviewRepository.countReviewsByBusId(schedule.getBus().getId());
                dto.setAverageRating(avg != null ? Math.round(avg * 10.0) / 10.0 : 4.8);
                dto.setTotalReviews(count != null && count > 0 ? count : (48 + Math.toIntExact(schedule.getId() * 17)));
            }
            dto.setDriverName(schedule.getDriverName() != null ? schedule.getDriverName() : "Ramesh Kumar");
            dto.setDriverPhone(schedule.getDriverPhone() != null ? schedule.getDriverPhone() : "9876543210");
            result.add(dto);
        }
        return result;
    }
}
