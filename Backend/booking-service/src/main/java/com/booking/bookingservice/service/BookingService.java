package com.booking.bookingservice.service;

import com.booking.bookingservice.dto.BookingRequest;
import com.booking.bookingservice.dto.BookingResponse;
import com.booking.bookingservice.entity.Booking;
import com.booking.bookingservice.entity.Schedule;
import com.booking.bookingservice.entity.Seat;
import com.booking.bookingservice.repository.BookingRepository;
import com.booking.bookingservice.repository.ScheduleRepository;
import com.booking.bookingservice.repository.SeatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Value("${notification.service.url:http://localhost:8084/api/notifications}")
    private String notificationServiceUrl;

    @Autowired
    private WalletClient walletClient;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Transactional
    public BookingResponse bookSeat(Long userId, BookingRequest request) {
        // Fetch schedule
        Schedule schedule = scheduleRepository.findById(request.getScheduleId())
            .orElseThrow(() -> new RuntimeException("Schedule not found"));

        if ("CANCELLED".equals(schedule.getStatus())) {
            throw new RuntimeException("This schedule is cancelled");
        }

        if (schedule.getDepartureTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Cannot book seats for a past schedule");
        }

        // Lock seat and verify availability
        Seat seat = seatRepository.findByIdWithLock(request.getSeatId())
            .orElseThrow(() -> new RuntimeException("Seat not found"));

        if ("BOOKED".equals(seat.getStatus())) {
            throw new RuntimeException("Sorry, this seat was just booked by someone else");
        }

        if (!seat.getSchedule().getId().equals(request.getScheduleId())) {
            throw new RuntimeException("Seat does not belong to this schedule");
        }

        // mark seat as booked
        seat.setStatus("BOOKED");
        seatRepository.save(seat);

        // decrease available seat count
        schedule.setAvailableSeats(schedule.getAvailableSeats() - 1);
        scheduleRepository.save(schedule);

        // Notify frontend about seat status change
        messagingTemplate.convertAndSend("/topic/schedule/" + schedule.getId() + "/seats", seat);

        // create booking record
        Double price = schedule.getPriceForThisTrip() != null
            ? schedule.getPriceForThisTrip()
            : schedule.getRoute().getBasePrice();

        Booking booking = new Booking();
        booking.setBookingReference(com.booking.bookingservice.util.BusinessIdGenerator.generateBookingReference());
        booking.setUserId(userId);
        booking.setSchedule(schedule);
        booking.setSeat(seat);
        booking.setStatus("CONFIRMED");
        booking.setAmountPaid(price);

        Booking saved = bookingRepository.save(booking);
        System.out.println("Booking confirmed: " + saved.getId() + " for user: " + userId);

        // build response
        BookingResponse response = new BookingResponse();
        response.setBookingId(saved.getId());
        response.setBookingReference(saved.getBookingReference());
        response.setScheduleId(schedule.getId());
        if (schedule.getBus() != null) {
            response.setBusId(schedule.getBus().getId());
        }
        response.setStatus(saved.getStatus());
        response.setSeatNumber(seat.getSeatNumber());
        response.setSource(schedule.getRoute().getSource());
        response.setDestination(schedule.getRoute().getDestination());
        response.setDepartureTime(schedule.getDepartureTime());
        response.setAmountPaid(saved.getAmountPaid());
        response.setBookedAt(saved.getBookedAt());

        response.setPassengerName(saved.getPassengerName());
        response.setPassengerAge(saved.getPassengerAge());
        response.setPassengerGender(saved.getPassengerGender());

        return response;
    }

    @Transactional
    public List<BookingResponse> bookSeatsBulk(Long userId, com.booking.bookingservice.dto.BulkBookingRequest request) {
        List<BookingResponse> responses = new ArrayList<>();

        // We will deduct the wallet balance at the end of the transaction to avoid charging if a seat is already booked

        for (com.booking.bookingservice.dto.PassengerBookingRequest pReq : request.getPassengers()) {
            BookingRequest singleReq = new BookingRequest();
            singleReq.setScheduleId(request.getScheduleId());
            singleReq.setSeatId(pReq.getSeatId());

            BookingResponse res = bookSeat(userId, singleReq);
            
            // Now update the passenger details on the saved booking
            Booking booking = bookingRepository.findById(res.getBookingId()).orElseThrow();
            booking.setPassengerName(pReq.getPassengerName());
            booking.setPassengerAge(pReq.getPassengerAge());
            booking.setPassengerGender(pReq.getPassengerGender());
            booking.setContactEmail(request.getContactEmail());
            booking.setContactPhone(request.getContactPhone());
            booking.setBoardingPoint(request.getBoardingPoint());
            booking.setDroppingPoint(request.getDroppingPoint());
            bookingRepository.save(booking);

            res.setPassengerName(pReq.getPassengerName());
            res.setPassengerAge(pReq.getPassengerAge());
            res.setPassengerGender(pReq.getPassengerGender());
            res.setBoardingPoint(request.getBoardingPoint());
            res.setDroppingPoint(request.getDroppingPoint());
            responses.add(res);
        }

        // Deduct money from wallet AFTER all DB operations succeed (bookings created)
        if ("wallet".equalsIgnoreCase(request.getPaymentMethod())) {
            Schedule schedule = scheduleRepository.findById(request.getScheduleId())
                .orElseThrow(() -> new RuntimeException("Schedule not found"));
            Double price = schedule.getPriceForThisTrip() != null
                ? schedule.getPriceForThisTrip()
                : schedule.getRoute().getBasePrice();
            Double totalAmount = price * request.getPassengers().size();
            
            // This will throw RuntimeException if balance is insufficient
            walletClient.deductMoney(userId, totalAmount);
        }

        // Trigger ticket email notification via REST
        if (request.getContactEmail() != null && !responses.isEmpty()) {
            java.time.format.DateTimeFormatter dtf = java.time.format.DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
            java.util.List<java.util.Map<String, Object>> bookingMaps = new java.util.ArrayList<>();
            for (BookingResponse br : responses) {
                java.util.Map<String, Object> bm = new java.util.HashMap<>();
                bm.put("bookingId", br.getBookingId() != null ? br.getBookingId().toString() : "-");
                bm.put("bookingReference", br.getBookingReference() != null ? br.getBookingReference() : "-");
                bm.put("status", br.getStatus() != null ? br.getStatus() : "CONFIRMED");
                bm.put("seatNumber", br.getSeatNumber() != null ? br.getSeatNumber() : "-");
                bm.put("source", br.getSource() != null ? br.getSource() : "-");
                bm.put("destination", br.getDestination() != null ? br.getDestination() : "-");
                bm.put("departureTime", br.getDepartureTime() != null ? br.getDepartureTime().format(dtf) : "-");
                bm.put("amountPaid", br.getAmountPaid() != null ? br.getAmountPaid().toString() : "0");
                bm.put("passengerName", br.getPassengerName() != null ? br.getPassengerName() : "Passenger");
                bm.put("passengerAge", br.getPassengerAge() != null ? br.getPassengerAge().toString() : "-");
                bm.put("passengerGender", br.getPassengerGender() != null ? br.getPassengerGender() : "-");
                bm.put("boardingPoint", br.getBoardingPoint() != null ? br.getBoardingPoint() : (br.getSource() != null ? br.getSource() : "-"));
                bm.put("droppingPoint", br.getDroppingPoint() != null ? br.getDroppingPoint() : (br.getDestination() != null ? br.getDestination() : "-"));
                bookingMaps.add(bm);
            }

            try {
                RestTemplate restTemplate = new RestTemplate();
                Map<String, Object> event = new HashMap<>();
                event.put("email", request.getContactEmail());
                event.put("bookings", bookingMaps);
                restTemplate.postForEntity(notificationServiceUrl + "/send-ticket", event, Map.class);
                System.out.println("✅ [Booking -> Notification REST] Sent ticket PDF email to: " + request.getContactEmail());
            } catch (Exception ex) {
                System.err.println("❌ [Booking -> Notification REST] Ticket email failed: " + ex.getMessage());
            }
        }

        return responses;
    }

    @Transactional
    public String cancelBooking(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));

        // make sure user can only cancel their own bookings
        if (!booking.getUserId().equals(userId)) {
            throw new RuntimeException("You can only cancel your own bookings");
        }

        if ("CANCELLED".equals(booking.getStatus())) {
            throw new RuntimeException("Booking is already cancelled");
        }

        // calculate refund
        LocalDateTime departureTime = booking.getSchedule().getDepartureTime();
        LocalDateTime now = LocalDateTime.now();
        
        if (now.isAfter(departureTime)) {
            throw new RuntimeException("Cannot cancel booking after departure time");
        }

        long hoursUntilDeparture = java.time.Duration.between(now, departureTime).toHours();
        
        double refundPercentage;
        if (hoursUntilDeparture > 48) {
            refundPercentage = 1.0;
        } else if (hoursUntilDeparture > 24) {
            refundPercentage = 0.8;
        } else if (hoursUntilDeparture > 12) {
            refundPercentage = 0.5;
        } else {
            refundPercentage = 0.0;
        }
        double refundAmount = booking.getAmountPaid() * refundPercentage;

        // 1. Mark booking as cancelled and save FIRST (prevents double refund)
        booking.setStatus("CANCELLED");
        bookingRepository.save(booking);

        // 2. Free up the seat
        Seat seat = booking.getSeat();
        seat.setStatus("AVAILABLE");
        seatRepository.save(seat);

        // 3. Increase available seat count back
        Schedule schedule = booking.getSchedule();
        schedule.setAvailableSeats(schedule.getAvailableSeats() + 1);
        scheduleRepository.save(schedule);

        // Notify frontend about seat status change (now available)
        messagingTemplate.convertAndSend("/topic/schedule/" + schedule.getId() + "/seats", seat);

        // 4. Add refund to wallet AFTER all DB operations succeed
        walletClient.addMoney(userId, refundAmount);

        System.out.println("Booking " + bookingId + " cancelled. Refund of " + refundAmount + " added to user " + userId);

        // Send Cancellation Email via REST to notification-service
        Map<String, Object> cancelEvent = new HashMap<>();
        cancelEvent.put("email", booking.getContactEmail() != null && !booking.getContactEmail().isBlank() ? booking.getContactEmail() : "passenger@easytravel.com");
        cancelEvent.put("bookingReference", booking.getBookingReference() != null ? booking.getBookingReference() : booking.getId().toString());
        cancelEvent.put("refundAmount", String.format("%.2f", refundAmount));
        cancelEvent.put("source", schedule.getRoute().getSource());
        cancelEvent.put("destination", schedule.getRoute().getDestination());
        try {
            RestTemplate restTemplate = new RestTemplate();
            restTemplate.postForEntity(notificationServiceUrl + "/send-cancellation", cancelEvent, Map.class);
            System.out.println("✅ [Booking -> Notification REST] Sent cancellation email to: " + cancelEvent.get("email"));
        } catch (Exception ex) {
            System.err.println("❌ [Booking -> Notification REST] Cancellation email failed: " + ex.getMessage());
        }

        return "Booking " + bookingId + " cancelled successfully. Refund of ₹" + String.format("%.2f", refundAmount) + " added to your wallet.";
    }

    public List<BookingResponse> getMyBookings(Long userId) {
        List<Booking> bookings = bookingRepository.findByUserId(userId);
        List<BookingResponse> result = new ArrayList<>();

        for (Booking b : bookings) {
            BookingResponse dto = new BookingResponse();
            dto.setBookingId(b.getId());
            dto.setBookingReference(b.getBookingReference());
            if (b.getSchedule() != null) {
                dto.setScheduleId(b.getSchedule().getId());
                if (b.getSchedule().getBus() != null) {
                    dto.setBusId(b.getSchedule().getBus().getId());
                }
            }
            dto.setStatus(b.getStatus());
            dto.setSeatNumber(b.getSeat().getSeatNumber());
            dto.setSource(b.getSchedule().getRoute().getSource());
            dto.setDestination(b.getSchedule().getRoute().getDestination());
            dto.setDepartureTime(b.getSchedule().getDepartureTime());
            dto.setAmountPaid(b.getAmountPaid());
            dto.setBookedAt(b.getBookedAt());
            dto.setPassengerName(b.getPassengerName());
            dto.setPassengerAge(b.getPassengerAge());
            dto.setPassengerGender(b.getPassengerGender());
            dto.setBoardingPoint(b.getBoardingPoint());
            dto.setDroppingPoint(b.getDroppingPoint());
            result.add(dto);
        }

        return result;
    }
}
