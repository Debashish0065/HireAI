package com.hireai.security.service;

import com.hireai.user.entity.User;
import com.hireai.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class CustomUserDetailsService
        implements UserDetailsService {


    private static final Logger log =
            LoggerFactory.getLogger(CustomUserDetailsService.class);


    private final UserRepository userRepository;


    // ============================================================
    // LOAD USER BY EMAIL
    // ============================================================

    /**
     * Loads a HireAI user using their email address.
     *
     * Spring Security uses this method during authentication
     * and the JWT filter uses it when restoring authentication
     * from a valid JWT.
     */
    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {


        if (email == null || email.isBlank()) {

            throw new UsernameNotFoundException(
                    "User email must not be empty"
            );
        }


        String normalizedEmail =
                email.trim();


        log.debug(
                "Loading user authentication details for email: {}",
                normalizedEmail
        );


        User user =
                userRepository.findByEmail(normalizedEmail)
                        .orElseThrow(() ->
                                new UsernameNotFoundException(
                                        "User not found"
                                )
                        );


        // ========================================================
        // USER VALIDATION
        // ========================================================

        if (user.getRole() == null) {

            log.error(
                    "User {} has no role configured",
                    normalizedEmail
            );

            throw new UsernameNotFoundException(
                    "User role is not configured"
            );
        }


        if (user.getPassword() == null
                || user.getPassword().isBlank()) {

            log.error(
                    "User {} has no password configured",
                    normalizedEmail
            );

            throw new UsernameNotFoundException(
                    "User password is not configured"
            );
        }


        // ========================================================
        // SPRING SECURITY USER
        // ========================================================

        UserDetails userDetails =
                org.springframework.security.core.userdetails.User
                        .builder()
                        .username(user.getEmail())
                        .password(user.getPassword())
                        .roles(user.getRole().name())
                        .build();


        log.debug(
                "User authentication details loaded successfully. " +
                "User ID: {}, Role: {}",
                user.getId(),
                user.getRole()
        );


        return userDetails;
    }
}