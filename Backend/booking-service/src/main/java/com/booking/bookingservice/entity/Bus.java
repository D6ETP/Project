package com.booking.bookingservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "buses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Bus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String busNumber; // like MH-12-AB-1234

    @Column(nullable = false)
    private Integer totalSeats;

    private String busType; // SLEEPER, SEATER, AC, NON_AC etc

    private String operatorName = "EasyTravel Express";
    
    @Column(columnDefinition = "LONGTEXT")
    private String operatorLogo;

    @Column(columnDefinition = "LONGTEXT")
    private String busImage;

    private Boolean active = true;
}

