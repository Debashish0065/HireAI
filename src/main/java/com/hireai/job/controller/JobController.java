package com.hireai.job.controller;

import com.hireai.job.dto.request.CreateJobRequest;
import com.hireai.job.dto.response.JobResponse;
import com.hireai.job.service.JobService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/jobs")
@Validated
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    // =========================================================
    // CREATE JOB - HR ONLY
    // =========================================================

    @PostMapping
    @PreAuthorize("hasRole('HR')")
    public JobResponse createJob(
            @Valid @RequestBody CreateJobRequest request,
            Authentication authentication
    ) {

        String email = getAuthenticatedEmail(authentication);

        return jobService.createJob(
                request,
                email
        );
    }

    // =========================================================
    // GET ALL JOBS
    // =========================================================

    @GetMapping
    public List<JobResponse> getAllJobs() {

        return jobService.getAllJobs();
    }

    // =========================================================
    // GET SINGLE JOB
    // =========================================================

    @GetMapping("/{id}")
    public JobResponse getJobById(
            @PathVariable
            @Positive(message = "Job ID must be greater than 0")
            Long id
    ) {

        return jobService.getJobById(id);
    }

    // =========================================================
    // GET HR OWN JOBS
    // =========================================================

    @GetMapping("/my-jobs")
    @PreAuthorize("hasRole('HR')")
    public List<JobResponse> getMyJobs(
            Authentication authentication
    ) {

        String email = getAuthenticatedEmail(authentication);

        return jobService.getMyJobs(email);
    }

    // =========================================================
    // UPDATE JOB - HR ONLY
    // =========================================================

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HR')")
    public JobResponse updateJob(
            @PathVariable
            @Positive(message = "Job ID must be greater than 0")
            Long id,

            @Valid @RequestBody CreateJobRequest request,

            Authentication authentication
    ) {

        String email = getAuthenticatedEmail(authentication);

        return jobService.updateJob(
                id,
                request,
                email
        );
    }

    // =========================================================
    // DELETE JOB - HR ONLY
    // =========================================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HR')")
    public String deleteJob(
            @PathVariable
            @Positive(message = "Job ID must be greater than 0")
            Long id,

            Authentication authentication
    ) {

        String email = getAuthenticatedEmail(authentication);

        jobService.deleteJob(
                id,
                email
        );

        return "Job deleted successfully";
    }

    // =========================================================
    // AUTHENTICATION HELPER
    // =========================================================

    private String getAuthenticatedEmail(Authentication authentication) {

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