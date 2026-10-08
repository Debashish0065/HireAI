package com.hireai.analytics.controller;

import com.hireai.analytics.dto.response.HRAnalyticsResponse;
import com.hireai.analytics.service.HRAnalyticsService;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/hr/analytics")
public class HRAnalyticsController {

    private final HRAnalyticsService hrAnalyticsService;

    public HRAnalyticsController(
            HRAnalyticsService hrAnalyticsService
    ) {
        this.hrAnalyticsService = hrAnalyticsService;
    }


    // =========================================================
    // HR DASHBOARD ANALYTICS
    // GET /api/v1/hr/analytics/dashboard
    // =========================================================

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('HR')")
    public HRAnalyticsResponse getDashboardAnalytics(
            Authentication authentication
    ) {

        return hrAnalyticsService.getDashboardAnalytics(
                authentication.getName()
        );
    }
}