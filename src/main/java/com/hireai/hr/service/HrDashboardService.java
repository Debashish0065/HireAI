package com.hireai.hr.service;

import com.hireai.hr.dto.response.HrDashboardResponse;

public interface HrDashboardService {

    HrDashboardResponse getDashboard(String email);
}