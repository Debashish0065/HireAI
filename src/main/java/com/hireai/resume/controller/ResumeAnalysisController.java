package com.hireai.resume.controller;

import com.hireai.resume.dto.response.ResumeAnalysisResponse;
import com.hireai.resume.service.ResumeAnalysisService;

import jakarta.validation.constraints.Positive;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/resumes")
@Validated
public class ResumeAnalysisController {

    private final ResumeAnalysisService resumeAnalysisService;

    public ResumeAnalysisController(
            ResumeAnalysisService resumeAnalysisService
    ) {
        this.resumeAnalysisService = resumeAnalysisService;
    }

    // =========================================================
    // AI RESUME ANALYSIS
    // =========================================================

    @PostMapping("/{id}/analyze")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResumeAnalysisResponse analyzeResume(
            @PathVariable
            @Positive(message = "Resume ID must be greater than 0")
            Long id,
            Authentication authentication
    ) {

        String email = getAuthenticatedEmail(authentication);

        return resumeAnalysisService.analyzeResume(
                id,
                email
        );
    }

    // =========================================================
    // AUTHENTICATION VALIDATION
    // =========================================================

    private String getAuthenticatedEmail(
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

        return email.trim();
    }
}