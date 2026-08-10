package com.notification.notificationservice.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.awt.Color;
import java.util.List;
import java.util.Map;

@Service
public class PdfTicketGenerator {

    public byte[] generatePdfTicket(List<Map<String, Object>> bookings) {
        if (bookings == null || bookings.isEmpty()) {
            return new byte[0];
        }

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(document, out);
            document.open();

            // Colors
            Color navyColor = new Color(11, 60, 93);       // #0B3C5D
            Color orangeColor = new Color(224, 123, 57);   // #E07B39
            Color lightBg = new Color(240, 244, 248);       // #F0F4F8
            Color greenColor = new Color(39, 174, 96);      // #27AE60

            // Header Banner
            PdfPTable headerTable = new PdfPTable(1);
            headerTable.setWidthPercentage(100);
            
            PdfPCell headerCell = new PdfPCell();
            headerCell.setBackgroundColor(navyColor);
            headerCell.setPadding(15);
            headerCell.setHorizontalAlignment(Element.ALIGN_CENTER);

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, Color.WHITE);
            Paragraph title = new Paragraph("EasyTravel E-TICKET", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            headerCell.addElement(title);

            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 12, Color.LIGHT_GRAY);
            Paragraph subtitle = new Paragraph("Official Bus Booking Confirmation Pass", subtitleFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            headerCell.addElement(subtitle);

            headerTable.addCell(headerCell);
            document.add(headerTable);
            document.add(new Paragraph(" "));

            // Journey Info Box
            Map<String, Object> first = bookings.get(0);
            String source = String.valueOf(first.getOrDefault("source", "N/A"));
            String destination = String.valueOf(first.getOrDefault("destination", "N/A"));
            String departureTime = String.valueOf(first.getOrDefault("departureTime", "N/A"));
            String boardingPoint = String.valueOf(first.getOrDefault("boardingPoint", source));
            String droppingPoint = String.valueOf(first.getOrDefault("droppingPoint", destination));

            double totalPaid = bookings.stream()
                .mapToDouble(b -> b.get("amountPaid") != null ? Double.parseDouble(b.get("amountPaid").toString()) : 0)
                .sum();

            PdfPTable routeTable = new PdfPTable(2);
            routeTable.setWidthPercentage(100);
            routeTable.setWidths(new float[]{1, 1});

            Font routeFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, navyColor);
            Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, navyColor);
            Font valueFont = FontFactory.getFont(FontFactory.HELVETICA, 11, Color.DARK_GRAY);

            PdfPCell r1 = new PdfPCell(new Paragraph("ROUTE: " + source + " → " + destination, routeFont));
            r1.setColspan(2);
            r1.setBackgroundColor(lightBg);
            r1.setPadding(10);
            r1.setBorder(Rectangle.NO_BORDER);
            routeTable.addCell(r1);

            PdfPCell c1 = new PdfPCell(new Paragraph("Departure Time: " + departureTime, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, orangeColor)));
            c1.setColspan(2);
            c1.setPadding(6);
            c1.setBorder(Rectangle.NO_BORDER);
            routeTable.addCell(c1);

            PdfPCell bCell = new PdfPCell();
            bCell.addElement(new Paragraph("Boarding Point:", labelFont));
            bCell.addElement(new Paragraph(boardingPoint, valueFont));
            bCell.setPadding(6);
            bCell.setBorder(Rectangle.NO_BORDER);
            routeTable.addCell(bCell);

            PdfPCell dCell = new PdfPCell();
            dCell.addElement(new Paragraph("Dropping Point:", labelFont));
            dCell.addElement(new Paragraph(droppingPoint, valueFont));
            dCell.setPadding(6);
            dCell.setBorder(Rectangle.NO_BORDER);
            routeTable.addCell(dCell);

            document.add(routeTable);
            document.add(new Paragraph(" "));

            // Passenger Details Table
            Font tableHeadFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Color.WHITE);
            PdfPTable passTable = new PdfPTable(4);
            passTable.setWidthPercentage(100);
            passTable.setWidths(new float[]{1, 2.5f, 2, 2});

            String[] headers = {"Seat", "Passenger Name", "Age / Gender", "Booking Ref"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Paragraph(h, tableHeadFont));
                cell.setBackgroundColor(navyColor);
                cell.setPadding(8);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                passTable.addCell(cell);
            }

            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.BLACK);
            Font seatFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, greenColor);

            for (Map<String, Object> b : bookings) {
                PdfPCell seatCell = new PdfPCell(new Paragraph(String.valueOf(b.getOrDefault("seatNumber", "-")), seatFont));
                seatCell.setPadding(6);
                seatCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                passTable.addCell(seatCell);

                PdfPCell nameCell = new PdfPCell(new Paragraph(String.valueOf(b.getOrDefault("passengerName", "Passenger")), bodyFont));
                nameCell.setPadding(6);
                passTable.addCell(nameCell);

                String ageGender = b.getOrDefault("passengerAge", "-") + " yrs / " + b.getOrDefault("passengerGender", "-");
                PdfPCell agCell = new PdfPCell(new Paragraph(ageGender, bodyFont));
                agCell.setPadding(6);
                agCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                passTable.addCell(agCell);

                String ref = "#" + b.getOrDefault("bookingReference", b.getOrDefault("bookingId", "-"));
                PdfPCell refCell = new PdfPCell(new Paragraph(ref, bodyFont));
                refCell.setPadding(6);
                refCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                passTable.addCell(refCell);
            }

            document.add(passTable);
            document.add(new Paragraph(" "));

            // Summary Table
            PdfPTable summaryTable = new PdfPTable(2);
            summaryTable.setWidthPercentage(100);

            PdfPCell statusCell = new PdfPCell(new Paragraph("STATUS: CONFIRMED", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, greenColor)));
            statusCell.setPadding(10);
            statusCell.setBorder(Rectangle.NO_BORDER);
            summaryTable.addCell(statusCell);

            PdfPCell priceCell = new PdfPCell(new Paragraph("TOTAL PAID: ₹" + totalPaid, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, orangeColor)));
            priceCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            priceCell.setPadding(10);
            priceCell.setBorder(Rectangle.NO_BORDER);
            summaryTable.addCell(priceCell);

            document.add(summaryTable);
            document.add(new Paragraph(" "));

            // Footer Note
            Font footerFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Font.ITALIC, Color.GRAY);
            Paragraph footer = new Paragraph("Important: Please report at the boarding point 15 minutes before departure. Carry a valid photo ID along with this ticket. Have a safe and happy journey with EasyTravel!", footerFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
            return out.toByteArray();

        } catch (Exception e) {
            e.printStackTrace();
            return new byte[0];
        }
    }
}
