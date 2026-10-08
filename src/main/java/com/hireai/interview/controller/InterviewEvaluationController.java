package com.hireai.interview.controller;

import com.hireai.interview.dto.request.InterviewEvaluationRequest;
import com.hireai.interview.dto.response.InterviewEvaluationResponse;
import com.hireai.interview.service.InterviewEvaluationService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/interview/evaluation")
@Validated
public class InterviewEvaluationController {

    private final InterviewEvaluationService evaluationService;

    public InterviewEvaluationController(
            InterviewEvaluationService evaluationService
    ) {
        this.evaluationService = evaluationService;
    }

    // =========================================================
    // EVALUATE INTERVIEW
    // POST /api/v1/interview/evaluation
    // =========================================================

    @PostMapping
    @PreAuthorize("hasRole('CANDIDATE')")
    public InterviewEvaluationResponse evaluateInterview(
            @Valid
            @RequestBody
            InterviewEvaluationRequest request,
            Authentication authentication
    ) {

        String email = getAuthenticatedEmail(authentication);

        return evaluationService.evaluateInterview(
                request,
                email
        );
    }

    // =========================================================
    // GET EVALUATION
    // GET /api/v1/interview/evaluation/{interviewId}
    // =========================================================

    @GetMapping("/{interviewId}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public InterviewEvaluationResponse getEvaluation(
            @PathVariable
            @Positive(message = "Interview ID must be greater than 0")
            Long interviewId,
            Authentication authentication
    ) {

        String email = getAuthenticatedEmail(authentication);

        return evaluationService.getEvaluation(
                interviewId,
                email
        );
    }

    // =========================================================
    // GET MY EVALUATIONS
    // GET /api/v1/interview/evaluation/my
    // =========================================================

    @GetMapping("/my")
    @PreAuthorize("hasRole('CANDIDATE')")
    public List<InterviewEvaluationResponse> getMyEvaluations(
            Authentication authentication
    ) {

        String email = getAuthenticatedEmail(authentication);

        return evaluationService.getMyEvaluations(email);
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

        return email;
    }
}