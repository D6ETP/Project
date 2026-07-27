package com.travel.authservice.service;

import com.travel.authservice.dto.AuthResponse;
import com.travel.authservice.dto.LoginRequest;
import com.travel.authservice.dto.SignupRequest;

public interface AuthService {

    AuthResponse register(SignupRequest request);
    
    AuthResponse login(LoginRequest request);

}