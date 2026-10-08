package com.hireai.user.service.impl;

import com.hireai.user.dto.request.UpdateProfileRequest;
import com.hireai.user.dto.response.UserProfileResponse;
import com.hireai.user.entity.User;
import com.hireai.user.repository.UserRepository;
import com.hireai.user.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public User saveUser(User user) {
        if (user == null) {
            throw new IllegalArgumentException("User is required.");
        }

        return userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findByEmail(String email) {
        if (email == null || email.isBlank()) {
            return Optional.empty();
        }

        return userRepository.findByEmail(normalizeEmail(email));
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        if (email == null || email.isBlank()) {
            return false;
        }

        return userRepository.existsByEmail(normalizeEmail(email));
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(String email) {

        User user = findUserByEmail(email);

        return mapToProfileResponse(user);
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(
            String email,
            UpdateProfileRequest request) {

        if (request == null) {
            throw new IllegalArgumentException("Profile update request is required.");
        }

        User user = findUserByEmail(email);

        /*
         * Only profile fields are updated here.
         *
         * Authentication and account fields such as:
         * - email
         * - password
         * - role
         * - firstName
         * - lastName
         * - resumeUrl
         *
         * are intentionally not modified by this endpoint.
         */

        if (request.getPhone() != null) {
            user.setPhone(trimToNull(request.getPhone()));
        }

        if (request.getLocation() != null) {
            user.setLocation(trimToNull(request.getLocation()));
        }

        if (request.getHeadline() != null) {
            user.setHeadline(trimToNull(request.getHeadline()));
        }

        if (request.getBio() != null) {
            user.setBio(trimToNull(request.getBio()));
        }

        if (request.getSkills() != null) {
            user.setSkills(trimToNull(request.getSkills()));
        }

        if (request.getExperience() != null) {
            if (request.getExperience() < 0) {
                throw new IllegalArgumentException(
                        "Experience cannot be negative."
                );
            }

            user.setExperience(request.getExperience());
        }

        if (request.getLinkedinUrl() != null) {
            user.setLinkedinUrl(trimToNull(request.getLinkedinUrl()));
        }

        if (request.getGithubUrl() != null) {
            user.setGithubUrl(trimToNull(request.getGithubUrl()));
        }

        if (request.getPortfolioUrl() != null) {
            user.setPortfolioUrl(trimToNull(request.getPortfolioUrl()));
        }

        if (request.getProfileImage() != null) {
            user.setProfileImage(trimToNull(request.getProfileImage()));
        }

        User savedUser = userRepository.save(user);

        return mapToProfileResponse(savedUser);
    }

    private User findUserByEmail(String email) {

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "User email is required."
            );
        }

        String normalizedEmail = normalizeEmail(email);

        return userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private String trimToNull(String value) {

        if (value == null) {
            return null;
        }

        String trimmed = value.trim();

        return trimmed.isEmpty() ? null : trimmed;
    }

    private UserProfileResponse mapToProfileResponse(User user) {

        if (user == null) {
            throw new IllegalArgumentException("User is required.");
        }

        return UserProfileResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .location(user.getLocation())
                .headline(user.getHeadline())
                .bio(user.getBio())
                .skills(user.getSkills())
                .experience(user.getExperience())
                .linkedinUrl(user.getLinkedinUrl())
                .githubUrl(user.getGithubUrl())
                .portfolioUrl(user.getPortfolioUrl())
                .profileImage(user.getProfileImage())
                .resumeUrl(user.getResumeUrl())
                .role(user.getRole() != null
                        ? user.getRole().name()
                        : null)
                .build();
    }
}