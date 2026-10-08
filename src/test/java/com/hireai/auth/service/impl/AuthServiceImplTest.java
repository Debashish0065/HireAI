package com.hireai.auth.service.impl;

import com.hireai.auth.dto.request.LoginRequest;
import com.hireai.auth.dto.request.RegisterRequest;
import com.hireai.auth.dto.response.AuthResponse;
import com.hireai.security.jwt.JwtService;
import com.hireai.user.entity.User;
import com.hireai.user.enums.Role;
import com.hireai.user.repository.UserRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;

import static org.mockito.Mockito.argThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthServiceImpl authService;

    // =========================================================
    // REGISTER - SUCCESS
    // =========================================================

    @Test
    void register_ShouldRegisterUser_WhenEmailDoesNotExist() {

        RegisterRequest request = new RegisterRequest();

        request.setFirstName("Test");
        request.setLastName("User");
        request.setEmail("test@gmail.com");
        request.setPassword("Password@123");

        when(userRepository.existsByEmail("test@gmail.com"))
                .thenReturn(false);

        when(passwordEncoder.encode("Password@123"))
                .thenReturn("encodedPassword");

        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        when(jwtService.generateToken(
                "test@gmail.com",
                Role.CANDIDATE.name()
        ))
                .thenReturn("test-jwt-token");

        AuthResponse response = authService.register(request);

        assertNotNull(response);

        assertEquals(
                "Registration Successful",
                response.getMessage()
        );

        assertEquals(
                "test-jwt-token",
                response.getToken()
        );

        verify(userRepository)
                .existsByEmail("test@gmail.com");

        verify(passwordEncoder)
                .encode("Password@123");

        verify(userRepository)
                .save(any(User.class));

        verify(jwtService)
                .generateToken(
                        "test@gmail.com",
                        Role.CANDIDATE.name()
                );
    }

    // =========================================================
    // REGISTER - EMAIL ALREADY EXISTS
    // =========================================================

    @Test
    void register_ShouldReturnError_WhenEmailAlreadyExists() {

        RegisterRequest request = new RegisterRequest();

        request.setFirstName("Test");
        request.setLastName("User");
        request.setEmail("existing@gmail.com");
        request.setPassword("Password@123");

        when(userRepository.existsByEmail("existing@gmail.com"))
                .thenReturn(true);

        AuthResponse response =
                authService.register(request);

        assertNotNull(response);

        assertEquals(
                "Email already exists",
                response.getToken()
        );

        assertNull(response.getMessage());

        verify(userRepository)
                .existsByEmail("existing@gmail.com");

        verify(userRepository, never())
                .save(any(User.class));

        verify(passwordEncoder, never())
                .encode(anyString());

        verify(jwtService, never())
                .generateToken(
                        anyString(),
                        anyString()
                );
    }

    // =========================================================
    // LOGIN - SUCCESS
    // =========================================================

    @Test
    void login_ShouldReturnSuccess_WhenCredentialsAreValid() {

        LoginRequest request = new LoginRequest();

        request.setEmail("test@gmail.com");
        request.setPassword("Password@123");

        User user = User.builder()
                .firstName("Test")
                .lastName("User")
                .email("test@gmail.com")
                .password("encodedPassword")
                .role(Role.CANDIDATE)
                .build();

        when(authenticationManager.authenticate(
                any(UsernamePasswordAuthenticationToken.class)
        ))
                .thenReturn(null);

        when(userRepository.findByEmail("test@gmail.com"))
                .thenReturn(Optional.of(user));

        when(jwtService.generateToken(
                "test@gmail.com",
                Role.CANDIDATE.name()
        ))
                .thenReturn("test-jwt-token");

        AuthResponse response =
                authService.login(request);

        assertNotNull(response);

        assertEquals(
                "Login Successful",
                response.getMessage()
        );

        assertEquals(
                "test-jwt-token",
                response.getToken()
        );

        verify(authenticationManager)
                .authenticate(
                        any(
                                UsernamePasswordAuthenticationToken.class
                        )
                );

        verify(userRepository)
                .findByEmail("test@gmail.com");

        verify(passwordEncoder, never())
                .matches(
                        anyString(),
                        anyString()
                );

        verify(jwtService)
                .generateToken(
                        "test@gmail.com",
                        Role.CANDIDATE.name()
                );
    }

    // =========================================================
    // LOGIN - USER NOT FOUND
    // =========================================================

    @Test
    void login_ShouldThrowException_WhenUserDoesNotExist() {

        LoginRequest request = new LoginRequest();

        request.setEmail("notfound@gmail.com");
        request.setPassword("Password@123");

        when(authenticationManager.authenticate(
                any(UsernamePasswordAuthenticationToken.class)
        ))
                .thenReturn(null);

        when(userRepository.findByEmail("notfound@gmail.com"))
                .thenReturn(Optional.empty());

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> authService.login(request)
                );

        assertEquals(
                "Invalid email or password.",
                exception.getMessage()
        );

        verify(authenticationManager)
                .authenticate(
                        any(
                                UsernamePasswordAuthenticationToken.class
                        )
                );

        verify(userRepository)
                .findByEmail("notfound@gmail.com");

        verify(jwtService, never())
                .generateToken(
                        anyString(),
                        anyString()
                );
    }

    // =========================================================
    // REGISTER - PASSWORD ENCODING
    // =========================================================

    @Test
    void register_ShouldEncodePasswordBeforeSaving() {

        RegisterRequest request = new RegisterRequest();

        request.setFirstName("Test");
        request.setLastName("User");
        request.setEmail("password@gmail.com");
        request.setPassword("Password@123");

        when(userRepository.existsByEmail("password@gmail.com"))
                .thenReturn(false);

        when(passwordEncoder.encode("Password@123"))
                .thenReturn("encodedPassword");

        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        when(jwtService.generateToken(
                "password@gmail.com",
                Role.CANDIDATE.name()
        ))
                .thenReturn("jwt-token");

        authService.register(request);

        verify(passwordEncoder)
                .encode("Password@123");

        verify(userRepository)
                .save(
                        argThat(user ->
                                "encodedPassword".equals(
                                        user.getPassword()
                                )
                        )
                );
    }

    // =========================================================
    // REGISTER - DEFAULT ROLE
    // =========================================================

    @Test
    void register_ShouldCreateCandidateRole_ByDefault() {

        RegisterRequest request = new RegisterRequest();

        request.setFirstName("Candidate");
        request.setLastName("User");
        request.setEmail("candidate@gmail.com");
        request.setPassword("Password@123");

        when(userRepository.existsByEmail("candidate@gmail.com"))
                .thenReturn(false);

        when(passwordEncoder.encode("Password@123"))
                .thenReturn("encodedPassword");

        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        when(jwtService.generateToken(
                "candidate@gmail.com",
                Role.CANDIDATE.name()
        ))
                .thenReturn("jwt-token");

        authService.register(request);

        verify(userRepository)
                .save(
                        argThat(user ->
                                user.getRole() == Role.CANDIDATE
                        )
                );
    }
}