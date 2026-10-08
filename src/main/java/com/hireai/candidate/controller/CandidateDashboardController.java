package com.hireai.candidate.controller;

import com.hireai.candidate.dto.response.CandidateDashboardResponse;
import com.hireai.candidate.service.CandidateDashboardService;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/candidates")
@Validated
public class CandidateDashboardController {

    private final CandidateDashboardService candidateDashboardService;

    public CandidateDashboardController(
            CandidateDashboardService candidateDashboardService
    ) {
        this.candidateDashboardService = candidateDashboardService;
    }

    /**
     * Get the authenticated candidate's dashboard.
     *
     * GET /api/v1/candidates/dashboard
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('CANDIDATE')")
    public CandidateDashboardResponse getDashboard(
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
                    "Authenticated candidate email is unavailable."
            );
        }

        return candidateDashboardService.getDashboard(email);
    }
}