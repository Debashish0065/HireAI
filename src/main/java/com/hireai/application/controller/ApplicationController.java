package com.hireai.application.controller;

import com.hireai.application.dto.request.ApplyJobRequest;
import com.hireai.application.dto.request.UpdateApplicationStatusRequest;
import com.hireai.application.dto.response.ApplicationResponse;
import com.hireai.application.service.ApplicationService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/applications")
@Validated
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    // =========================================================
    // CANDIDATE - APPLY FOR JOB
    // POST /api/v1/applications
    // =========================================================

    @PostMapping
    @PreAuthorize("hasRole('CANDIDATE')")
    public ApplicationResponse applyJob(
            @Valid @RequestBody ApplyJobRequest request,
            Authentication authentication
    ) {

        return applicationService.applyJob(
                request,
                authentication.getName()
        );
    }

    // =========================================================
    // CANDIDATE - MY APPLICATIONS
    // GET /api/v1/applications/my
    // =========================================================

    @GetMapping("/my")
    @PreAuthorize("hasRole('CANDIDATE')")
    public List<ApplicationResponse> getMyApplications(
            Authentication authentication
    ) {

        return applicationService.getMyApplications(
                authentication.getName()
        );
    }

    // =========================================================
    // CANDIDATE - GET APPLICATION BY ID
    // GET /api/v1/applications/{id}
    // =========================================================

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ApplicationResponse getMyApplicationById(
            @Positive @PathVariable Long id,
            Authentication authentication
    ) {

        return applicationService.getMyApplicationById(
                id,
                authentication.getName()
        );
    }

    // =========================================================
    // CANDIDATE - WITHDRAW APPLICATION
    // DELETE /api/v1/applications/{id}
    // =========================================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public String withdrawApplication(
            @Positive @PathVariable Long id,
            Authentication authentication
    ) {

        applicationService.withdrawApplication(
                id,
                authentication.getName()
        );

        return "Application withdrawn successfully";
    }

    // =========================================================
    // HR - GET ALL APPLICANTS
    // GET /api/v1/applications/hr
    // =========================================================

    @GetMapping("/hr")
    @PreAuthorize("hasRole('HR')")
    public List<ApplicationResponse> getApplicantsForHR(
            Authentication authentication
    ) {

        return applicationService.getApplicantsForHR(
                authentication.getName()
        );
    }

    // =========================================================
    // HR - GET APPLICANTS FOR SPECIFIC JOB
    // GET /api/v1/applications/hr/job/{jobId}
    // =========================================================

    @GetMapping("/hr/job/{jobId}")
    @PreAuthorize("hasRole('HR')")
    public List<ApplicationResponse> getApplicantsForHRJob(
            @Positive @PathVariable Long jobId,
            Authentication authentication
    ) {

        return applicationService.getApplicantsForHRJob(
                jobId,
                authentication.getName()
        );
    }

    // =========================================================
    // HR - UPDATE APPLICATION STATUS
    // PUT /api/v1/applications/{id}/status
    // =========================================================

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('HR')")
    public ApplicationResponse updateStatus(
            @Positive @PathVariable Long id,
            @Valid @RequestBody UpdateApplicationStatusRequest request,
            Authentication authentication
    ) {

        return applicationService.updateStatus(
                id,
                request,
                authentication.getName()
        );
    }

    // =========================================================
    // CANDIDATE - CHECK IF ALREADY APPLIED
    // GET /api/v1/applications/check/{jobId}
    // =========================================================

    @GetMapping("/check/{jobId}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public boolean hasApplied(
            @Positive @PathVariable Long jobId,
            Authentication authentication
    ) {

        return applicationService.hasApplied(
                jobId,
                authentication.getName()
        );
    }
}