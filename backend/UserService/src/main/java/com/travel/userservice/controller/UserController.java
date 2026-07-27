package com.travel.userservice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.travel.userservice.dto.UserRequest;
import com.travel.userservice.dto.UserResponse;
import com.travel.userservice.service.UserService;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<UserResponse> createUser(
            @RequestBody UserRequest request) {

        return ResponseEntity.ok(userService.createUser(request));
    }

    // Fetch logged-in user's profile
    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getProfile(
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(userService.getUserByEmail(email));
    }

    // Update logged-in user's profile
    @PutMapping
    public ResponseEntity<UserResponse> updateUser(
            @RequestBody UserRequest request,
            Authentication authentication) {

        request.setEmail(authentication.getName());

        return ResponseEntity.ok(userService.updateUser(request));
    }
}