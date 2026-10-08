package com.hireai.user.controller;

import com.hireai.user.dto.request.UpdateProfileRequest;
import com.hireai.user.dto.response.UserProfileResponse;
import com.hireai.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@Validated
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Get the currently authenticated user's profile.
     */
    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public UserProfileResponse profile(Authentication authentication) {
        String email = getAuthenticatedEmail(authentication);
        return userService.getProfile(email);
    }

    /**
     * Update the currently authenticated user's profile.
     */
    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public UserProfileResponse updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {

        String email = getAuthenticatedEmail(authentication);
        return userService.updateProfile(email, request);
    }

    private String getAuthenticatedEmail(Authentication authentication) {
        if (authentication == null) {
            throw new IllegalStateException(
                    "Authentication information is unavailable."
            );
        }

        String email = authentication.getName();

        if (email == null || email.isBlank()) {
            throw new IllegalStateException(
                    "Authenticated user email is unavailable."
            );
        }

        return email.trim();
    }
}