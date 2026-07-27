package com.travel.authservice.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignupRequest {

    private String fullName;

    private String email;

    private String password;

    private String phone;

    private String gender;

    private String address;
}