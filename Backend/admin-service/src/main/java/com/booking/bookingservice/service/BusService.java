package com.booking.bookingservice.service;

import com.booking.bookingservice.entity.Bus;
import com.booking.bookingservice.repository.BusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BusService {

    @Autowired
    private BusRepository busRepository;

    public List<Bus> getAllBuses() {
        return busRepository.findAll();
    }

    public Bus addBus(Bus bus) {
        return busRepository.save(bus);
    }

    public Bus toggleBusStatus(Long id) {
        Bus bus = busRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Bus not found with id: " + id));
        bus.setActive(bus.getActive() == null || !bus.getActive());
        return busRepository.save(bus);
    }
}

