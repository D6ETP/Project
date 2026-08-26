package com.booking.bookingservice.service;

import com.booking.bookingservice.client.NotificationClient;
import com.booking.bookingservice.dto.BookingRequest;
import com.booking.bookingservice.dto.BookingResponse;
import com.booking.bookingservice.dto.BulkBookingRequest;
import com.booking.bookingservice.dto.PassengerBookingRequest;
import com.booking.bookingservice.entity.Booking;
import com.booking.bookingservice.entity.Schedule;
import com.booking.bookingservice.entity.Seat;
import com.booking.bookingservice.repository.BookingRepository;
import com.booking.bookingservice.repository.ScheduleRepository;
import com.booking.bookingservice.repository.SeatRepository;
import com.booking.bookingservice.util.BusinessIdGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private WalletClient walletClient;

    @Autowired
    private NotificationClient notificationClient;

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
        booking.setBookingReference(BusinessIdGenerator.generateBookingReference());
        booking.setUserId(userId);
        booking.setSchedule(schedule);
        booking.setSeat(seat);
        booking.setStatus("CONFIRMED");
        booking.setAmountPaid(price);

        Booking saved = bookingRepository.save(booking);
        log.info("Booking confirmed: {} for user: {}", saved.getId(), userId);

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
    public List<BookingResponse> bookSeatsBulk(Long userId, BulkBookingRequest request) {
        List<BookingResponse> responses = new ArrayList<>();

        Schedule schedule = scheduleRepository.findById(request.getScheduleId())
            .orElseThrow(() -> new RuntimeException("Schedule not found"));

        Double basePrice = schedule.getPriceForThisTrip() != null
            ? schedule.getPriceForThisTrip()
            : schedule.getRoute().getBasePrice();

        int passengerCount = request.getPassengers().size();
        Double totalOriginalPrice = basePrice * passengerCount;

        // Calculate discount and net payable amount
        Double discount = 0.0;
        if (request.getDiscountAmount() != null && request.getDiscountAmount() > 0) {
            discount = Math.min(request.getDiscountAmount(), totalOriginalPrice);
        }

        Double totalFinalPrice = Math.max(0.0, totalOriginalPrice - discount);
        Double pricePerSeat = passengerCount > 0 ? (Math.round((totalFinalPrice / passengerCount) * 100.0) / 100.0) : basePrice;

        // We will deduct the wallet balance at the end of the transaction to avoid charging if a seat is already booked
        for (PassengerBookingRequest pReq : request.getPassengers()) {
            BookingRequest singleReq = new BookingRequest();
            singleReq.setScheduleId(request.getScheduleId());
            singleReq.setSeatId(pReq.getSeatId());

            BookingResponse res = bookSeat(userId, singleReq);
            
            // Now update the passenger details and actual discounted amount on the saved booking
            Booking booking = bookingRepository.findById(res.getBookingId()).orElseThrow();
            booking.setPassengerName(pReq.getPassengerName());
            booking.setPassengerAge(pReq.getPassengerAge());
            booking.setPassengerGender(pReq.getPassengerGender());
            booking.setContactEmail(request.getContactEmail());
            booking.setContactPhone(request.getContactPhone());
            booking.setBoardingPoint(request.getBoardingPoint());
            booking.setDroppingPoint(request.getDroppingPoint());
            booking.setAmountPaid(pricePerSeat);
            bookingRepository.save(booking);

            res.setAmountPaid(pricePerSeat);
            res.setPassengerName(pReq.getPassengerName());
            res.setPassengerAge(pReq.getPassengerAge());
            res.setPassengerGender(pReq.getPassengerGender());
            res.setBoardingPoint(request.getBoardingPoint());
            res.setDroppingPoint(request.getDroppingPoint());
            responses.add(res);
        }

        // Deduct accurate final price from wallet AFTER all DB operations succeed
        if ("wallet".equalsIgnoreCase(request.getPaymentMethod())) {
            walletClient.deductMoney(userId, totalFinalPrice);
        }

        // Trigger ticket email notification via circuit-breaker-protected REST client
        if (request.getContactEmail() != null && !responses.isEmpty()) {
            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
            List<Map<String, Object>> bookingMaps = new ArrayList<>();
            for (BookingResponse br : responses) {
                Map<String, Object> bm = new HashMap<>();
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
            notificationClient.sendTicketEmail(request.getContactEmail(), bookingMaps);
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

        long hoursUntilDeparture = Duration.between(now, departureTime).toHours();
        
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
        double refundAmount = Math.round(booking.getAmountPaid() * refundPercentage * 100.0) / 100.0;

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
        if (refundAmount > 0) {
            walletClient.addMoney(userId, refundAmount);
        } else {
            log.info("Booking {} cancelled with 0% refund (less than 12h before departure). No wallet credit required.", bookingId);
        }

        log.info("Booking {} cancelled. Refund of {} added to user {}", bookingId, refundAmount, userId);

        // Send Cancellation Email via REST to notification-service
        Map<String, Object> cancelEvent = new HashMap<>();
        cancelEvent.put("email", booking.getContactEmail() != null && !booking.getContactEmail().isBlank() ? booking.getContactEmail() : "passenger@easytravel.com");
        cancelEvent.put("bookingReference", booking.getBookingReference() != null ? booking.getBookingReference() : booking.getId().toString());
        cancelEvent.put("refundAmount", String.format("%.2f", refundAmount));
        cancelEvent.put("source", schedule.getRoute().getSource());
        cancelEvent.put("destination", schedule.getRoute().getDestination());
        notificationClient.sendCancellationEmail(cancelEvent);

        return "Booking " + bookingId + " cancelled successfully. Refund of Rs. " + String.format("%.2f", refundAmount) + " added to your wallet.";
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
