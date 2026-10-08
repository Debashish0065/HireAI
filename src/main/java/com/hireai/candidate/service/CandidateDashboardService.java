package com.hireai.candidate.service;

import com.hireai.candidate.dto.response.CandidateDashboardResponse;

public interface CandidateDashboardService {

    CandidateDashboardResponse getDashboard(String email);
}