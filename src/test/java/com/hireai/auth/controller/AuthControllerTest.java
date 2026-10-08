package com.hireai.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hireai.auth.dto.request.LoginRequest;
import com.hireai.auth.dto.request.RegisterRequest;
import com.hireai.auth.dto.response.AuthResponse;
import com.hireai.auth.service.AuthService;
import com.hireai.user.enums.Role;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {

        mockMvc = MockMvcBuilders
                .standaloneSetup(authController)
                .build();

        objectMapper = new ObjectMapper();
    }

    // =========================================================
    // REGISTER - SUCCESS
    // =========================================================

    @Test
    void register_ShouldReturn200_WhenRegistrationIsSuccessful()
            throws Exception {

        RegisterRequest request = new RegisterRequest();

        request.setFirstName("John");
        request.setLastName("Doe");
        request.setEmail("john.doe@gmail.com");
        request.setPassword("Password@123");
        request.setRole(Role.CANDIDATE);

        AuthResponse response = new AuthResponse();

        when(authService.register(any(RegisterRequest.class)))
                .thenReturn(response);

        mockMvc.perform(
                        post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        objectMapper.writeValueAsString(request)
                                )
                )
                .andExpect(status().isOk());
    }

    // =========================================================
    // REGISTER - SERVICE CALLED
    // =========================================================

    @Test
    void register_ShouldCallAuthService()
            throws Exception {

        RegisterRequest request = new RegisterRequest();

        request.setFirstName("John");
        request.setLastName("Doe");
        request.setEmail("john.doe@gmail.com");
        request.setPassword("Password@123");
        request.setRole(Role.CANDIDATE);

        AuthResponse response = new AuthResponse();

        when(authService.register(any(RegisterRequest.class)))
                .thenReturn(response);

        mockMvc.perform(
                        post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        objectMapper.writeValueAsString(request)
                                )
                )
                .andExpect(status().isOk());

        verify(authService)
                .register(any(RegisterRequest.class));
    }

    // =========================================================
    // REGISTER - RESPONSE BODY
    // =========================================================

    @Test
    void register_ShouldReturnResponseBody()
            throws Exception {

        RegisterRequest request = new RegisterRequest();

        request.setFirstName("John");
        request.setLastName("Doe");
        request.setEmail("john.doe@gmail.com");
        request.setPassword("Password@123");
        request.setRole(Role.CANDIDATE);

        AuthResponse response = new AuthResponse();

        when(authService.register(any(RegisterRequest.class)))
                .thenReturn(response);

        mockMvc.perform(
                        post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        objectMapper.writeValueAsString(request)
                                )
                )
                .andExpect(status().isOk())
                .andExpect(
                        content().contentTypeCompatibleWith(
                                MediaType.APPLICATION_JSON
                        )
                );
    }

    // =========================================================
    // REGISTER - INVALID REQUEST
    // =========================================================

    @Test
    void register_ShouldReturn400_WhenRequiredFieldsAreMissing()
            throws Exception {

        RegisterRequest request = new RegisterRequest();

        mockMvc.perform(
                        post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        objectMapper.writeValueAsString(request)
                                )
                )
                .andExpect(status().isBadRequest());
    }

    // =========================================================
    // REGISTER - INVALID EMAIL
    // =========================================================

    @Test
    void register_ShouldReturn400_WhenEmailIsInvalid()
            throws Exception {

        RegisterRequest request = new RegisterRequest();

        request.setFirstName("John");
        request.setLastName("Doe");
        request.setEmail("invalid-email");
        request.setPassword("Password@123");

        mockMvc.perform(
                        post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        objectMapper.writeValueAsString(request)
                                )
                )
                .andExpect(status().isBadRequest());
    }

    // =========================================================
    // LOGIN - SUCCESS
    // =========================================================

    @Test
    void login_ShouldReturn200_WhenLoginIsSuccessful()
            throws Exception {

        LoginRequest request = new LoginRequest();

        request.setEmail("john.doe@gmail.com");
        request.setPassword("Password@123");

        AuthResponse response = new AuthResponse();

        when(authService.login(any(LoginRequest.class)))
                .thenReturn(response);

        mockMvc.perform(
                        post("/api/v1/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        objectMapper.writeValueAsString(request)
                                )
                )
                .andExpect(status().isOk());
    }

    // =========================================================
    // LOGIN - SERVICE CALLED
    // =========================================================

    @Test
    void login_ShouldCallAuthService()
            throws Exception {

        LoginRequest request = new LoginRequest();

        request.setEmail("john.doe@gmail.com");
        request.setPassword("Password@123");

        AuthResponse response = new AuthResponse();

        when(authService.login(any(LoginRequest.class)))
                .thenReturn(response);

        mockMvc.perform(
                        post("/api/v1/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        objectMapper.writeValueAsString(request)
                                )
                )
                .andExpect(status().isOk());

        verify(authService)
                .login(any(LoginRequest.class));
    }

    // =========================================================
    // LOGIN - RESPONSE BODY
    // =========================================================

    @Test
    void login_ShouldReturnResponseBody()
            throws Exception {

        LoginRequest request = new LoginRequest();

        request.setEmail("john.doe@gmail.com");
        request.setPassword("Password@123");

        AuthResponse response = new AuthResponse();

        when(authService.login(any(LoginRequest.class)))
                .thenReturn(response);

        mockMvc.perform(
                        post("/api/v1/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        objectMapper.writeValueAsString(request)
                                )
                )
                .andExpect(status().isOk())
                .andExpect(
                        content().contentTypeCompatibleWith(
                                MediaType.APPLICATION_JSON
                        )
                );
    }

    // =========================================================
    // LOGIN - EMPTY EMAIL
    // =========================================================

    @Test
    void login_ShouldReturn400_WhenEmailIsMissing()
            throws Exception {

        LoginRequest request = new LoginRequest();

        request.setEmail("");
        request.setPassword("Password@123");

        mockMvc.perform(
                        post("/api/v1/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        objectMapper.writeValueAsString(request)
                                )
                )
                .andExpect(status().isBadRequest());
    }

    // =========================================================
    // LOGIN - INVALID EMAIL
    // =========================================================

    @Test
    void login_ShouldReturn400_WhenEmailIsInvalid()
            throws Exception {

        LoginRequest request = new LoginRequest();

        request.setEmail("invalid-email");
        request.setPassword("Password@123");

        mockMvc.perform(
                        post("/api/v1/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        objectMapper.writeValueAsString(request)
                                )
                )
                .andExpect(status().isBadRequest());
    }
}