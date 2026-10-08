package com.hireai.auth.service.impl;

import com.hireai.auth.dto.request.LoginRequest;
import com.hireai.auth.dto.request.RegisterRequest;
import com.hireai.auth.dto.response.AuthResponse;
import com.hireai.auth.service.AuthService;
import com.hireai.security.jwt.JwtService;
import com.hireai.user.entity.User;
import com.hireai.user.enums.Role;
import com.hireai.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    // =========================================================
    // REGISTER
    // =========================================================

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Registration request is required."
            );
        }

        String email = normalizeEmail(request.getEmail());

        if (userRepository.existsByEmail(email)) {
            return new AuthResponse(
                    null,
                    "Email already exists"
            );
        }

        /*
         * Public registration is allowed only for:
         *
         * CANDIDATE
         * HR
         *
         * ADMIN registration is intentionally blocked.
         *
         * If no role is supplied, the account defaults to
         * CANDIDATE for backward compatibility.
         */
        Role role = request.getRole();

        if (role == null) {
            role = Role.CANDIDATE;
        }

        if (role != Role.CANDIDATE && role != Role.HR) {
            throw new IllegalArgumentException(
                    "Invalid registration role."
            );
        }

        User user = User.builder()
                .firstName(
                        normalizeName(request.getFirstName())
                )
                .lastName(
                        normalizeName(request.getLastName())
                )
                .email(email)
                .password(
                        passwordEncoder.encode(
                                request.getPassword()
                        )
                )
                .role(role)
                .build();

        User savedUser = userRepository.save(user);

        String token = jwtService.generateToken(
                savedUser.getEmail(),
                savedUser.getRole().name()
        );

        return new AuthResponse(
                "Registration Successful",
                token
        );
    }

    // =========================================================
    // LOGIN
    // =========================================================

    @Override
    public AuthResponse login(LoginRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Login request is required."
            );
        }

        String email = normalizeEmail(request.getEmail());

        try {

            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            email,
                            request.getPassword()
                    )
            );

        } catch (AuthenticationException ex) {

            /*
             * Do not expose whether the email exists or whether
             * the password was incorrect.
             */
            throw new IllegalArgumentException(
                    "Invalid email or password."
            );
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invalid email or password."
                        )
                );

        if (user.getRole() == null) {
            throw new IllegalStateException(
                    "User role is not configured."
            );
        }

        String token = jwtService.generateToken(
                user.getEmail(),
                user.getRole().name()
        );

        return new AuthResponse(
                "Login Successful",
                token
        );
    }

    // =========================================================
    // VALIDATION / NORMALIZATION
    // =========================================================

    private String normalizeEmail(String email) {

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "Email is required."
            );
        }

        return email.trim().toLowerCase();
    }

    private String normalizeName(String name) {

        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException(
                    "Name is required."
            );
        }

        return name.trim();
    }
}