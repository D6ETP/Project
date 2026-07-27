package com.travel.userservice.service;

import com.travel.userservice.dto.UserRequest;
import com.travel.userservice.dto.UserResponse;

public interface UserService {

    UserResponse createUser(UserRequest request);

    UserResponse getUserByEmail(String email);

    UserResponse updateUser(UserRequest request);

}