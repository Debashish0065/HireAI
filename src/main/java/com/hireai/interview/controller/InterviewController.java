package com.hireai.interview.controller;

import com.hireai.interview.dto.request.StartInterviewRequest;
import com.hireai.interview.dto.request.SubmitAnswerRequest;
import com.hireai.interview.dto.response.InterviewResponse;
import com.hireai.interview.dto.response.InterviewStatisticsResponse;
import com.hireai.interview.service.InterviewService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/interviews")
@Validated
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(
            InterviewService interviewService
    ) {
        this.interviewService = interviewService;
    }

    // =========================================================
    // START INTERVIEW
    // POST /api/v1/interviews
    // =========================================================

    @PostMapping
    @PreAuthorize("hasRole('CANDIDATE')")
    public InterviewResponse startInterview(
            @Valid @RequestBody StartInterviewRequest request,
            Authentication authentication
    ) {

        String email = getAuthenticatedEmail(authentication);

        return interviewService.startInterview(
                request,
                email
        );
    }

    // =========================================================
    // GET MY INTERVIEWS
    // GET /api/v1/interviews/my
    // =========================================================

    @GetMapping("/my")
    @PreAuthorize("hasRole('CANDIDATE')")
    public List<InterviewResponse> getMyInterviews(
            Authentication authentication
    ) {

        String email = getAuthenticatedEmail(authentication);

        return interviewService.getMyInterviews(email);
    }

    // =========================================================
    // GET MY INTERVIEW BY ID
    // GET /api/v1/interviews/{id}
    // =========================================================

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public InterviewResponse getMyInterviewById(
            @PathVariable
            @Positive(message = "Interview ID must be greater than 0")
            Long id,
            Authentication authentication
    ) {

        String email = getAuthenticatedEmail(authentication);

        return interviewService.getMyInterviewById(
                id,
                email
        );
    }

    // =========================================================
    // SUBMIT ANSWER
    // PUT /api/v1/interviews/answer
    // =========================================================

    @PutMapping("/answer")
    @PreAuthorize("hasRole('CANDIDATE')")
    public InterviewResponse submitAnswer(
            @Valid @RequestBody SubmitAnswerRequest request,
            Authentication authentication
    ) {

        String email = getAuthenticatedEmail(authentication);

        return interviewService.submitAnswer(
                request,
                email
        );
    }

    // =========================================================
    // COMPLETE INTERVIEW
    // PUT /api/v1/interviews/{id}/complete
    // =========================================================

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasRole('CANDIDATE')")
    public InterviewResponse completeInterview(
            @PathVariable
            @Positive(message = "Interview ID must be greater than 0")
            Long id,
            Authentication authentication
    ) {

        String email = getAuthenticatedEmail(authentication);

        return interviewService.completeInterview(
                id,
                email
        );
    }

    // =========================================================
    // ADMIN / HR INTERVIEW STATISTICS
    // GET /api/v1/interviews/admin/statistics
    // =========================================================

    @GetMapping("/admin/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public InterviewStatisticsResponse getInterviewStatisticsForAdmin() {

        return interviewService.getInterviewStatisticsForAdmin();
    }

    // =========================================================
    // ADMIN / HR GET INTERVIEW BY ID
    // GET /api/v1/interviews/admin/{id}
    // =========================================================

    @GetMapping("/admin/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public InterviewResponse getInterviewByIdForAdmin(
            @PathVariable
            @Positive(message = "Interview ID must be greater than 0")
            Long id
    ) {

        return interviewService.getInterviewByIdForAdmin(id);
    }

    // =========================================================
    // ADMIN / HR GET ALL INTERVIEWS
    // GET /api/v1/interviews/admin
    // =========================================================

    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public List<InterviewResponse> getAllInterviews() {

        return interviewService.getAllInterviews();
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