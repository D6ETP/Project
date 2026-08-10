package com.booking.bookingservice.util;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class BusinessIdGenerator {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");

    public static String generateBookingReference() {
        return "BK" + LocalDateTime.now().format(DATE_FORMATTER) + generateRandomDigits(4);
    }

    public static String generateTransactionReference() {
        return "TRX" + LocalDateTime.now().format(DATE_FORMATTER) + generateRandomDigits(4);
    }

    private static String generateRandomDigits(int length) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            sb.append(RANDOM.nextInt(10));
        }
        return sb.toString();
    }
}
