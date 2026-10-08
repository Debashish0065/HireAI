package com.hireai.auth.service;

import com.hireai.auth.dto.request.LoginRequest;
import com.hireai.auth.dto.request.RegisterRequest;
import com.hireai.auth.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}