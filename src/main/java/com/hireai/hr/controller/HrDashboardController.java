package com.hireai.hr.controller;

import com.hireai.hr.dto.response.HrDashboardResponse;
import com.hireai.hr.service.HrDashboardService;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/hr")
@Validated
public class HrDashboardController {

    private final HrDashboardService hrDashboardService;

    public HrDashboardController(
            HrDashboardService hrDashboardService
    ) {
        this.hrDashboardService = hrDashboardService;
    }

    // =========================================================
    // HR DASHBOARD
    // GET /api/v1/hr/dashboard
    // =========================================================

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('HR')")
    public HrDashboardResponse getDashboard(
            Authentication authentication
    ) {

        if (authentication == null) {
            throw new IllegalStateException(
                    "Authentication information is unavailable."
            );
        }

        String email = authentication.getName();

        if (email == null || email.isBlank()) {
            throw new IllegalStateException(
                    "Authenticated HR email is unavailable."
            );
        }

        return hrDashboardService.getDashboard(email);
    }
}