package com.travel.authservice.service.impl;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.travel.authservice.dto.AuthResponse;
import com.travel.authservice.dto.LoginRequest;
import com.travel.authservice.dto.SignupRequest;
import com.travel.authservice.dto.UserRequest;
import com.travel.authservice.dto.UserResponse;
import com.travel.authservice.entity.Role;
import com.travel.authservice.entity.User;
import com.travel.authservice.exception.InvalidCredentialsException;
import com.travel.authservice.repository.UserRepository;
import com.travel.authservice.service.AuthService;
import com.travel.authservice.util.JwtService;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RestTemplate restTemplate;
    	
    public AuthServiceImpl(UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            RestTemplate restTemplate) {
this.userRepository = userRepository;
this.passwordEncoder = passwordEncoder;
this.jwtService = jwtService;
this.restTemplate = restTemplate;
}

    @Override
    public AuthResponse register(SignupRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            return new AuthResponse("Email already exists", null);
        }

        User user = new User();

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());

        
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        user.setRole(Role.USER);

        User savedUser = userRepository.save(user);

        UserRequest userRequest = new UserRequest();

        userRequest.setFullName(savedUser.getFullName());
        userRequest.setEmail(savedUser.getEmail());
        userRequest.setPhone(request.getPhone());
        userRequest.setGender(request.getGender());
        userRequest.setAddress(request.getAddress());

        restTemplate.postForObject(
                "http://localhost:8082/users",
                userRequest,
                UserResponse.class
        );

        return new AuthResponse("User Registered Successfully", null);
    }
    
    
    @Override
    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid Email"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid Password");
        }

        String token = jwtService.generateToken(user.getEmail());

        return new AuthResponse("Login Successful", token);
    }
}