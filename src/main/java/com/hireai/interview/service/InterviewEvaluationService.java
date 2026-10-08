package com.hireai.interview.service;

import com.hireai.interview.dto.request.InterviewEvaluationRequest;
import com.hireai.interview.dto.response.InterviewEvaluationResponse;

import java.util.List;

public interface InterviewEvaluationService {

    // =========================================================
    // CREATE AI EVALUATION
    // =========================================================

    InterviewEvaluationResponse evaluateInterview(
            InterviewEvaluationRequest request,
            String email
    );

    // =========================================================
    // GET EVALUATION
    // =========================================================

    InterviewEvaluationResponse getEvaluation(
            Long interviewId,
            String email
    );

    // =========================================================
    // GET MY EVALUATIONS
    // =========================================================

    List<InterviewEvaluationResponse> getMyEvaluations(
            String email
    );
}