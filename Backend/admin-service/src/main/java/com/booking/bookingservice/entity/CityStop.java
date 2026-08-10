package com.booking.bookingservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "city_stops")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CityStop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String city;

    private String stopName;

    private Boolean active = true;
}
