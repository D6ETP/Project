package com.travel.userservice.service.impl;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.travel.userservice.dto.UserRequest;
import com.travel.userservice.dto.UserResponse;
import com.travel.userservice.entity.User;
import com.travel.userservice.repository.UserRepository;
import com.travel.userservice.service.UserService;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserResponse getUserByEmail(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserResponse response = new UserResponse();

        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setGender(user.getGender());
        response.setDateOfBirth(user.getDateOfBirth());
        response.setAddress(user.getAddress());

        return response;
    }
    
    @Override
    public UserResponse updateUser(UserRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setGender(request.getGender());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setAddress(request.getAddress());

        user = userRepository.save(user);

        UserResponse response = new UserResponse();

        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setGender(user.getGender());
        response.setDateOfBirth(user.getDateOfBirth());
        response.setAddress(user.getAddress());

        return response;
    }
    
    @Override
    public UserResponse createUser(UserRequest request) {

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .gender(request.getGender())
                .dateOfBirth(request.getDateOfBirth())
                .address(request.getAddress())
                .createdAt(LocalDateTime.now())
                .build();

        user = userRepository.save(user);

        UserResponse response = new UserResponse();

        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setGender(user.getGender());
        response.setDateOfBirth(user.getDateOfBirth());
        response.setAddress(user.getAddress());

        return response;
    }
}