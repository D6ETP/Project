package com.notification.notificationservice.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private PdfTicketGenerator pdfTicketGenerator;

    @Value("${spring.mail.username}")
    private String fromEmail;

    // --- EVENT 1a: REGISTRATION OTP EMAIL ---
    public void sendRegistrationOtp(String toEmail, String otp) {
        if (toEmail == null || toEmail.isEmpty()) return;
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("EasyTravel — Your Verification OTP");
            message.setText(
                "Hello!\n\n" +
                "Thank you for signing up with EasyTravel. Your One-Time Password (OTP) for registration is:\n\n" +
                "    " + otp + "\n\n" +
                "This OTP is valid for 10 minutes. Do not share this code with anyone.\n\n" +
                "Safe Travels,\n" +
                "— EasyTravel Team"
            );
            mailSender.send(message);
            System.out.println("✅ Registration OTP email sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("⚠️ Failed to send registration OTP to " + toEmail + ": " + e.getMessage());
        }
    }

    // --- EVENT 1b: WELCOME EMAIL ON REGISTRATION SUCCESS ---
    public void sendWelcomeEmail(String toEmail, String fullName) {
        if (toEmail == null || toEmail.isEmpty()) return;
        System.out.println("📧 [NotificationService] Sending welcome email to: " + toEmail);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            // Subject without emoji to avoid MessagingException encoding errors with Gmail SMTP
            helper.setSubject("Welcome to EasyTravel, " + (fullName != null ? fullName : "Traveler") + "!");

            String name = fullName != null ? fullName : "Traveler";
            String html = "<html>"
                + "<body style='font-family: Arial, sans-serif; background-color: #F0F4F8; margin: 0; padding: 20px;'>"
                + "<div style='max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);'>"
                + "<div style='background: linear-gradient(135deg, #0B3C5D 0%, #328CC1 100%); padding: 30px; text-align: center; color: #ffffff;'>"
                + "<h1 style='margin: 0; font-size: 26px;'>EasyTravel</h1>"
                + "<p style='margin: 5px 0 0 0; opacity: 0.9; font-size: 15px;'>Welcome to India's Premium Bus Booking Platform</p>"
                + "</div>"
                + "<div style='padding: 25px; color: #333333; line-height: 1.6;'>"
                + "<h2 style='color: #0B3C5D; margin-top: 0;'>Hello " + name + ",</h2>"
                + "<p>Your EasyTravel account has been successfully created and verified!</p>"
                + "<p>With EasyTravel you can enjoy:</p>"
                + "<ul style='color: #4B5563;'>"
                + "<li>Instant booking on thousands of routes</li>"
                + "<li>Real-time live bus tracking</li>"
                + "<li>Instant PDF E-Tickets sent straight to your email</li>"
                + "<li>Secure payments &amp; zero hassle refunds</li>"
                + "</ul>"
                + "<br/>"
                + "<p style='text-align: center;'>"
                + "<a href='http://localhost:5173' style='background: #E07B39; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 20px; font-weight: bold;'>Book Your First Trip Now</a>"
                + "</p>"
                + "<br/>"
                + "<p style='font-size: 13px; color: #6B7280; text-align: center;'>Happy Travels,<br/><strong>The EasyTravel Team</strong></p>"
                + "</div>"
                + "</div>"
                + "</body></html>";

            helper.setText(html, true);
            mailSender.send(message);
            System.out.println("✅ Welcome email sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("⚠️ Failed to send welcome email to " + toEmail + ": " + e.getMessage());
            e.printStackTrace();
        }
    }


    // --- EVENT 2a: RESET PASSWORD OTP EMAIL ---
    public void sendPasswordResetOtp(String toEmail, String otp) {
        if (toEmail == null || toEmail.isEmpty()) return;
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("EasyTravel — Password Reset OTP");
            message.setText(
                "Hello!\n\n" +
                "You requested a password reset for your EasyTravel account. Your OTP code is:\n\n" +
                "    " + otp + "\n\n" +
                "This code is valid for 10 minutes. If you did not request this, please secure your account immediately.\n\n" +
                "— EasyTravel Support Team"
            );
            mailSender.send(message);
            System.out.println("✅ Password reset OTP email sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("⚠️ Failed to send password reset OTP to " + toEmail + ": " + e.getMessage());
        }
    }

    // --- EVENT 2b: PASSWORD RESET SUCCESS CONFIRMATION ---
    public void sendPasswordResetSuccessEmail(String toEmail) {
        if (toEmail == null || toEmail.isEmpty()) return;
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("EasyTravel — Password Reset Successful");
            message.setText(
                "Hello,\n\n" +
                "Your EasyTravel account password was successfully updated.\n\n" +
                "If you did not make this change, please contact our support team immediately.\n\n" +
                "— EasyTravel Security Team"
            );
            mailSender.send(message);
            System.out.println("✅ Password reset success email sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("⚠️ Failed to send password reset success email to " + toEmail + ": " + e.getMessage());
        }
    }

    // --- EVENT 3: BOOKING CONFIRMATION & PDF E-TICKET ATTACHMENT ---
    public void sendBookingConfirmation(String toEmail, List<Map<String, Object>> bookings) {
        if (toEmail == null || toEmail.isEmpty() || bookings == null || bookings.isEmpty()) return;
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);

            Map<String, Object> first = bookings.get(0);
            String source = String.valueOf(first.getOrDefault("source", "N/A"));
            String destination = String.valueOf(first.getOrDefault("destination", "N/A"));
            String departureTime = String.valueOf(first.getOrDefault("departureTime", "N/A"));
            String boardingPoint = String.valueOf(first.getOrDefault("boardingPoint", source));
            String droppingPoint = String.valueOf(first.getOrDefault("droppingPoint", destination));

            double totalPaid = bookings.stream()
                .mapToDouble(b -> b.get("amountPaid") != null ? Double.parseDouble(b.get("amountPaid").toString()) : 0)
                .sum();

            helper.setSubject("🚌 EasyTravel — Ticket Confirmation: " + source + " to " + destination);

            // Construct Passenger Rows HTML
            StringBuilder passengerRows = new StringBuilder();
            for (Map<String, Object> b : bookings) {
                passengerRows.append("<tr>")
                    .append("<td style='padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #27AE60;'>").append(b.getOrDefault("seatNumber", "-")).append("</td>")
                    .append("<td style='padding: 10px; border-bottom: 1px solid #eee; color: #1A1A2E;'>").append(b.getOrDefault("passengerName", "Passenger")).append("</td>")
                    .append("<td style='padding: 10px; border-bottom: 1px solid #eee; color: #6B7280;'>").append(b.getOrDefault("passengerAge", "-")).append(" yrs / ").append(b.getOrDefault("passengerGender", "-")).append("</td>")
                    .append("<td style='padding: 10px; border-bottom: 1px solid #eee; color: #0B3C5D; font-weight: bold;'>#").append(b.getOrDefault("bookingReference", b.getOrDefault("bookingId", "-"))).append("</td>")
                    .append("</tr>");
            }

            // HTML Email Template
            String htmlContent = "<html>"
                + "<body style='font-family: Arial, sans-serif; background-color: #F0F4F8; margin: 0; padding: 20px;'>"
                + "<div style='max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);'>"
                // Banner Header
                + "<div style='background: linear-gradient(135deg, #0B3C5D 0%, #328CC1 100%); padding: 30px; text-align: center; color: #ffffff;'>"
                + "<h1 style='margin: 0; font-size: 24px;'>🚌 EasyTravel</h1>"
                + "<p style='margin: 5px 0 0 0; opacity: 0.85; font-size: 14px;'>E-Ticket Booking Confirmation</p>"
                + "</div>"
                // Journey Banner
                + "<div style='padding: 25px; border-bottom: 2px dashed #E5E7EB; text-align: center; background: #F8FAFC;'>"
                + "<h2 style='margin: 0; color: #0B3C5D; font-size: 22px;'>" + source + " &rarr; " + destination + "</h2>"
                + "<p style='margin: 8px 0 0 0; color: #E07B39; font-weight: bold; font-size: 16px;'>Departure: " + departureTime + "</p>"
                + "</div>"
                // Ticket Details Body
                + "<div style='padding: 25px;'>"
                + "<table style='width: 100%; margin-bottom: 20px; font-size: 14px;'>"
                + "<tr>"
                + "<td><strong>Boarding Point:</strong><br/><span style='color: #4B5563;'>" + boardingPoint + "</span></td>"
                + "<td style='text-align: right;'><strong>Dropping Point:</strong><br/><span style='color: #4B5563;'>" + droppingPoint + "</span></td>"
                + "</tr>"
                + "</table>"
                + "<h3 style='margin: 20px 0 10px 0; color: #0B3C5D; font-size: 16px; border-bottom: 2px solid #0B3C5D; padding-bottom: 5px;'>Passenger & Seat List</h3>"
                + "<table style='width: 100%; border-collapse: collapse; font-size: 14px;'>"
                + "<thead><tr style='background: #F1F5F9; text-align: left; color: #475569;'>"
                + "<th style='padding: 8px;'>Seat</th><th style='padding: 8px;'>Name</th><th style='padding: 8px;'>Age/Gender</th><th style='padding: 8px;'>Booking Reference</th>"
                + "</tr></thead>"
                + "<tbody>" + passengerRows + "</tbody>"
                + "</table>"
                // Payment summary
                + "<div style='margin-top: 25px; padding: 15px; background: #EFF6FF; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;'>"
                + "<div><span style='color: #1E40AF; font-weight: bold;'>Booking Status:</span> <span style='background: #D1FAE5; color: #065F46; padding: 3px 8px; border-radius: 12px; font-weight: bold;'>CONFIRMED</span></div>"
                + "<div style='font-size: 16px; font-weight: bold; color: #E07B39;'>Total Paid: ₹" + totalPaid + "</div>"
                + "</div>"
                + "<p style='margin-top: 25px; font-size: 12px; color: #9CA3AF; text-align: center;'>Your official PDF E-Ticket is attached below. Please show this at boarding. Have a safe journey with EasyTravel!</p>"
                + "</div>"
                + "</div>"
                + "</body></html>";

            helper.setText(htmlContent, true);

            // Generate and attach PDF E-Ticket
            byte[] pdfBytes = pdfTicketGenerator.generatePdfTicket(bookings);
            if (pdfBytes != null && pdfBytes.length > 0) {
                String pdfName = "EasyTravel_Ticket_" + source.replaceAll("\\s+", "_") + "_to_" + destination.replaceAll("\\s+", "_") + ".pdf";
                helper.addAttachment(pdfName, new ByteArrayResource(pdfBytes), "application/pdf");
            }

            mailSender.send(message);
            System.out.println("✅ Beautiful HTML Ticket email with PDF attachment sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("⚠️ Failed to send formatted ticket email to " + toEmail + ": " + e.getMessage());
        }
    }

    // --- EVENT 4: BOARDING / PICKUP REMINDER ---
    public void sendTripUpcomingReminder(String toEmail, String source, String destination, String departureTime) {
        if (toEmail == null || toEmail.isEmpty()) return;
        System.out.println("✅ [REMINDER] Sending boarding reminder to " + toEmail + " for " + source + " → " + destination);
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("⏰ EasyTravel — Boarding Reminder: " + source + " to " + destination);
            String text = "Hi Passenger,\n\nYour bus from " + source + " to " + destination + " scheduled at " + departureTime + " will depart in 30 minutes.\n\nPlease ensure you reach the boarding point on time and carry your PDF E-Ticket.\n\nHave a safe trip,\nEasyTravel Team";
            message.setText(text);
            mailSender.send(message);
            System.out.println("✅ Boarding reminder sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("⚠️ Failed to send boarding reminder to " + toEmail + ": " + e.getMessage());
        }
    }

    // --- EVENT 5: JOURNEY COMPLETED THANK YOU EMAIL ---
    public void sendTripCompletedNotification(String toEmail, String source, String destination) {
        if (toEmail == null || toEmail.isEmpty()) return;
        System.out.println("✅ [COMPLETED] Sending trip completion email to " + toEmail + " for " + source + " → " + destination);
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("🌟 EasyTravel — Hope you had a great trip from " + source + " to " + destination + "!");
            String text = "Hi Passenger,\n\nYour trip from " + source + " to " + destination + " has been completed successfully.\n\nWe hope you had a comfortable journey with EasyTravel! We'd love to hear your feedback on your driver and bus experience.\n\nThank you for choosing EasyTravel!\nEasyTravel Team";
            message.setText(text);
            mailSender.send(message);
            System.out.println("✅ Trip completion email sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("⚠️ Failed to send trip completion email to " + toEmail + ": " + e.getMessage());
        }
    }

    // --- EVENT 6: BOOKING CANCELLATION NOTIFICATION ---
    public void sendBookingCancellationNotification(String toEmail, Map<String, Object> details) {
        if (toEmail == null || toEmail.isEmpty()) return;
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("EasyTravel — Booking Cancellation Confirmation");
            String bookingRef = String.valueOf(details.getOrDefault("bookingReference", "N/A"));
            String refund = String.valueOf(details.getOrDefault("refundAmount", "0.00"));

            message.setText(
                "Hello,\n\n" +
                "Your booking (Ref #" + bookingRef + ") with EasyTravel has been cancelled as per your request.\n\n" +
                "Refund Amount: ₹" + refund + "\n" +
                "The refund will be credited back to your original payment method within 3-5 business days.\n\n" +
                "We hope to see you aboard again soon!\n\n" +
                "Best Regards,\n" +
                "— EasyTravel Team"
            );
            mailSender.send(message);
            System.out.println("✅ Cancellation email sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("⚠️ Failed to send cancellation email to " + toEmail + ": " + e.getMessage());
        }
    }
}
