package com.booking.authservice.service;

import com.booking.authservice.client.NotificationClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    @Autowired
    private NotificationClient notificationClient;

    // In-memory store: email → { otp, expiresAt }
    private final Map<String, OtpEntry> otpStore = new ConcurrentHashMap<>();

    private static final int OTP_VALID_MINUTES = 10;
    private static final SecureRandom random = new SecureRandom();

    /**
     * Generates a 6-digit OTP, stores it, and delegates email sending to notification-service via REST.
     */
    public void generateAndSend(String email) {
        int code = 100000 + random.nextInt(900000);
        String otp = String.valueOf(code);

        otpStore.put(email, new OtpEntry(otp, LocalDateTime.now().plusMinutes(OTP_VALID_MINUTES)));

        // Send to notification-service via REST
        notificationClient.sendRegistrationOtp(email, otp);
    }

    /**
     * Generates OTP for password reset and delegates to notification-service via REST.
     */
    public void generateAndSendPasswordReset(String email) {
        int code = 100000 + random.nextInt(900000);
        String otp = String.valueOf(code);

        otpStore.put(email, new OtpEntry(otp, LocalDateTime.now().plusMinutes(OTP_VALID_MINUTES)));

        // Send to notification-service via REST
        notificationClient.sendPasswordResetOtp(email, otp);
    }

    /**
     * Verifies an OTP for the given email.
     */
    public boolean verify(String email, String otp) {
        OtpEntry entry = otpStore.get(email);
        if (entry == null) return false;

        if (LocalDateTime.now().isAfter(entry.expiresAt)) {
            otpStore.remove(email);
            return false;
        }

        if (entry.otp.equals(otp)) {
            otpStore.remove(email);
            return true;
        }
        return false;
    }

    private static class OtpEntry {
        final String otp;
        final LocalDateTime expiresAt;

        OtpEntry(String otp, LocalDateTime expiresAt) {
            this.otp = otp;
            this.expiresAt = expiresAt;
        }
    }
}
