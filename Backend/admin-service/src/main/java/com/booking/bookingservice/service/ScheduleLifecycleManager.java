package com.booking.bookingservice.service;

import com.booking.bookingservice.entity.Schedule;
import com.booking.bookingservice.repository.ScheduleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ScheduleLifecycleManager {

    private static final Logger logger = LoggerFactory.getLogger(ScheduleLifecycleManager.class);

    @Autowired
    private ScheduleRepository scheduleRepository;

    // Run every minute
    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void updateScheduleStatuses() {
        LocalDateTime now = LocalDateTime.now();
        logger.info("Running automated schedule lifecycle manager at {}", now);

        // 1. Transition SCHEDULED -> RUNNING
        List<Schedule> scheduledTrips = scheduleRepository.findByStatus("SCHEDULED");
        for (Schedule schedule : scheduledTrips) {
            if (now.isAfter(schedule.getDepartureTime()) || now.isEqual(schedule.getDepartureTime())) {
                schedule.setStatus("RUNNING");
                scheduleRepository.save(schedule);
                logger.info("Automated Transition: Schedule {} (Bus {}) started RUNNING.", schedule.getId(), schedule.getBus().getBusNumber());
            }
        }

        // 2. Transition RUNNING -> COMPLETED
        List<Schedule> runningTrips = scheduleRepository.findByStatus("RUNNING");
        for (Schedule schedule : runningTrips) {
            if (schedule.getArrivalTime() != null && (now.isAfter(schedule.getArrivalTime()) || now.isEqual(schedule.getArrivalTime()))) {
                schedule.setStatus("COMPLETED");
                scheduleRepository.save(schedule);
                logger.info("Automated Transition: Schedule {} (Bus {}) COMPLETED.", schedule.getId(), schedule.getBus().getBusNumber());
            }
        }
    }
}
