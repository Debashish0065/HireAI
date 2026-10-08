package com.hireai.analytics.service;

import com.hireai.analytics.dto.response.HRAnalyticsResponse;

public interface HRAnalyticsService {

    // Get analytics for the logged-in HR
    HRAnalyticsResponse getDashboardAnalytics(String email);
}