package com.hireai.user.service;

import com.hireai.user.dto.request.UpdateProfileRequest;
import com.hireai.user.dto.response.UserProfileResponse;
import com.hireai.user.entity.User;

import java.util.Optional;

public interface UserService {

    User saveUser(User user);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    UserProfileResponse getProfile(String email);

    UserProfileResponse updateProfile(String email, UpdateProfileRequest request);
}