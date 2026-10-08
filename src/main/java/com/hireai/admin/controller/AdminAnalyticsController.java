package com.hireai.admin.controller;

import com.hireai.admin.dto.response.AdminAnalyticsResponse;
import com.hireai.admin.service.AdminAnalyticsService;

import jakarta.validation.constraints.Positive;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/v1/admin/analytics")
@PreAuthorize("hasRole('ADMIN')")
@Validated
public class AdminAnalyticsController {

    private final AdminAnalyticsService adminAnalyticsService;


    public AdminAnalyticsController(
            AdminAnalyticsService adminAnalyticsService) {

        this.adminAnalyticsService =
                adminAnalyticsService;
    }


    // =========================================================
    // ADMIN ANALYTICS DASHBOARD
    // =========================================================
    // GET /api/v1/admin/analytics/dashboard
    // =========================================================

    @GetMapping("/dashboard")
    public AdminAnalyticsResponse getAnalytics() {

        return adminAnalyticsService.getAnalytics();
    }
}