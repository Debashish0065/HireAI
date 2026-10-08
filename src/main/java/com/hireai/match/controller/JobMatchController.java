package com.hireai.match.controller;

import com.hireai.match.dto.request.JobMatchRequest;
import com.hireai.match.dto.response.JobMatchResponse;
import com.hireai.match.service.JobMatchService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/job-matches")
@Validated
public class JobMatchController {

    private final JobMatchService jobMatchService;

    public JobMatchController(
            JobMatchService jobMatchService
    ) {
        this.jobMatchService = jobMatchService;
    }

    // =========================================================
    // AI MATCH RESUME WITH JOB
    // POST /api/v1/job-matches
    // =========================================================

    @PostMapping
    @PreAuthorize("hasRole('CANDIDATE')")
    public JobMatchResponse matchResumeWithJob(
            @Valid @RequestBody JobMatchRequest request,
            Authentication authentication
    ) {

        String email = getAuthenticatedEmail(authentication);

        return jobMatchService.matchResumeWithJob(
                request,
                email
        );
    }

    // =========================================================
    // GET MY JOB MATCHES
    // GET /api/v1/job-matches/my
    // =========================================================

    @GetMapping("/my")
    @PreAuthorize("hasRole('CANDIDATE')")
    public List<JobMatchResponse> getMyMatches(
            Authentication authentication
    ) {

        String email = getAuthenticatedEmail(authentication);

        return jobMatchService.getMyMatches(email);
    }

    // =========================================================
    // GET MATCH BY ID
    // GET /api/v1/job-matches/{id}
    // =========================================================

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public JobMatchResponse getMatchById(
            @PathVariable
            @Positive(message = "Job match ID must be greater than 0")
            Long id,
            Authentication authentication
    ) {

        String email = getAuthenticatedEmail(authentication);

        return jobMatchService.getMatchById(
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
                    "Authenticated user email is unavailable."
            );
        }

        return email;
    }
}