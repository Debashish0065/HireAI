package com.hireai.interview.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hireai.interview.dto.request.InterviewEvaluationRequest;
import com.hireai.interview.dto.response.InterviewEvaluationResponse;
import com.hireai.interview.service.InterviewEvaluationService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.http.MediaType;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class InterviewEvaluationControllerTest {

    @Mock
    private InterviewEvaluationService evaluationService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private InterviewEvaluationController evaluationController;

    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    private final String candidateEmail =
            "candidate@hireai.com";


    @BeforeEach
    void setUp() {

        mockMvc =
                MockMvcBuilders
                        .standaloneSetup(
                                evaluationController
                        )
                        .build();

        objectMapper =
                new ObjectMapper();

        objectMapper.findAndRegisterModules();
    }


    // =========================================================
    // EVALUATE INTERVIEW - SUCCESS
    // =========================================================

    @Test
    void evaluateInterview_ShouldReturn200_WhenSuccessful()
            throws Exception {

        when(authentication.getName())
                .thenReturn(candidateEmail);

        InterviewEvaluationRequest request =
                InterviewEvaluationRequest.builder()
                        .interviewId(10L)
                        .build();

        InterviewEvaluationResponse response =
                createEvaluationResponse(1L);

        when(evaluationService.evaluateInterview(
                any(InterviewEvaluationRequest.class),
                eq(candidateEmail)
        )).thenReturn(response);

        mockMvc.perform(
                post("/api/v1/interview/evaluation")
                        .contentType(
                                MediaType.APPLICATION_JSON
                        )
                        .content(
                                objectMapper.writeValueAsString(
                                        request
                                )
                        )
                        .principal(authentication)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id")
                .value(1))
        .andExpect(jsonPath("$.interviewId")
                .value(10))
        .andExpect(jsonPath("$.overallScore")
                .value(85))
        .andExpect(jsonPath("$.technicalScore")
                .value(90))
        .andExpect(jsonPath("$.communicationScore")
                .value(80))
        .andExpect(jsonPath("$.confidenceScore")
                .value(85));
    }


    // =========================================================
    // EVALUATE INTERVIEW - SERVICE CALLED
    // =========================================================

    @Test
    void evaluateInterview_ShouldCallService()
            throws Exception {

        when(authentication.getName())
                .thenReturn(candidateEmail);

        InterviewEvaluationRequest request =
                InterviewEvaluationRequest.builder()
                        .interviewId(20L)
                        .build();

        when(evaluationService.evaluateInterview(
                any(InterviewEvaluationRequest.class),
                eq(candidateEmail)
        )).thenReturn(
                createEvaluationResponse(2L)
        );

        mockMvc.perform(
                post("/api/v1/interview/evaluation")
                        .contentType(
                                MediaType.APPLICATION_JSON
                        )
                        .content(
                                objectMapper.writeValueAsString(
                                        request
                                )
                        )
                        .principal(authentication)
        )
        .andExpect(status().isOk());

        verify(evaluationService)
                .evaluateInterview(
                        any(InterviewEvaluationRequest.class),
                        eq(candidateEmail)
                );
    }


    // =========================================================
    // EVALUATE INTERVIEW - VALIDATION
    // =========================================================

    @Test
    void evaluateInterview_ShouldReturn400_WhenInterviewIdMissing()
            throws Exception {

        InterviewEvaluationRequest request =
                InterviewEvaluationRequest.builder()
                        .build();

        mockMvc.perform(
                post("/api/v1/interview/evaluation")
                        .contentType(
                                MediaType.APPLICATION_JSON
                        )
                        .content(
                                objectMapper.writeValueAsString(
                                        request
                                )
                        )
                        .principal(authentication)
        )
        .andExpect(status().isBadRequest());
    }


    // =========================================================
    // EVALUATE INTERVIEW - COMPLETE RESPONSE
    // =========================================================

    @Test
    void evaluateInterview_ShouldReturnCompleteResponse()
            throws Exception {

        when(authentication.getName())
                .thenReturn(candidateEmail);

        InterviewEvaluationRequest request =
                InterviewEvaluationRequest.builder()
                        .interviewId(30L)
                        .build();

        InterviewEvaluationResponse response =
                InterviewEvaluationResponse.builder()
                        .id(3L)
                        .interviewId(30L)
                        .overallScore(92)
                        .technicalScore(95)
                        .communicationScore(90)
                        .confidenceScore(91)
                        .strengths(
                                "Strong Java and Spring Boot knowledge"
                        )
                        .weaknesses(
                                "Could improve system design depth"
                        )
                        .feedback(
                                "Excellent technical performance"
                        )
                        .recommendation(
                                "Highly Recommended"
                        )
                        .createdAt(
                                LocalDateTime.of(
                                        2026,
                                        8,
                                        17,
                                        10,
                                        30
                                )
                        )
                        .build();

        when(evaluationService.evaluateInterview(
                any(InterviewEvaluationRequest.class),
                eq(candidateEmail)
        )).thenReturn(response);

        mockMvc.perform(
                post("/api/v1/interview/evaluation")
                        .contentType(
                                MediaType.APPLICATION_JSON
                        )
                        .content(
                                objectMapper.writeValueAsString(
                                        request
                                )
                        )
                        .principal(authentication)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id")
                .value(3))
        .andExpect(jsonPath("$.interviewId")
                .value(30))
        .andExpect(jsonPath("$.overallScore")
                .value(92))
        .andExpect(jsonPath("$.technicalScore")
                .value(95))
        .andExpect(jsonPath("$.communicationScore")
                .value(90))
        .andExpect(jsonPath("$.confidenceScore")
                .value(91))
        .andExpect(jsonPath("$.strengths")
                .value(
                        "Strong Java and Spring Boot knowledge"
                ))
        .andExpect(jsonPath("$.weaknesses")
                .value(
                        "Could improve system design depth"
                ))
        .andExpect(jsonPath("$.feedback")
                .value(
                        "Excellent technical performance"
                ))
        .andExpect(jsonPath("$.recommendation")
                .value(
                        "Highly Recommended"
                ));
    }


    // =========================================================
    // GET EVALUATION - SUCCESS
    // =========================================================

    @Test
    void getEvaluation_ShouldReturn200_WhenSuccessful()
            throws Exception {

        when(authentication.getName())
                .thenReturn(candidateEmail);

        when(evaluationService.getEvaluation(
                10L,
                candidateEmail
        )).thenReturn(
                createEvaluationResponse(10L)
        );

        mockMvc.perform(
                get("/api/v1/interview/evaluation/10")
                        .principal(authentication)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id")
                .value(10))
        .andExpect(jsonPath("$.interviewId")
                .value(10));
    }


    // =========================================================
    // GET EVALUATION - SERVICE CALLED
    // =========================================================

    @Test
    void getEvaluation_ShouldCallService()
            throws Exception {

        when(authentication.getName())
                .thenReturn(candidateEmail);

        when(evaluationService.getEvaluation(
                15L,
                candidateEmail
        )).thenReturn(
                createEvaluationResponse(15L)
        );

        mockMvc.perform(
                get("/api/v1/interview/evaluation/15")
                        .principal(authentication)
        )
        .andExpect(status().isOk());

        verify(evaluationService)
                .getEvaluation(
                        15L,
                        candidateEmail
                );
    }


    // =========================================================
    // GET MY EVALUATIONS - SUCCESS
    // =========================================================

    @Test
    void getMyEvaluations_ShouldReturn200()
            throws Exception {

        when(authentication.getName())
                .thenReturn(candidateEmail);

        when(evaluationService.getMyEvaluations(
                candidateEmail
        )).thenReturn(
                List.of(
                        createEvaluationResponse(1L),
                        createEvaluationResponse(2L)
                )
        );

        mockMvc.perform(
                get("/api/v1/interview/evaluation/my")
                        .principal(authentication)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()")
                .value(2));
    }


    // =========================================================
    // GET MY EVALUATIONS - EMPTY
    // =========================================================

    @Test
    void getMyEvaluations_ShouldReturnEmptyList()
            throws Exception {

        when(authentication.getName())
                .thenReturn(candidateEmail);

        when(evaluationService.getMyEvaluations(
                candidateEmail
        )).thenReturn(List.of());

        mockMvc.perform(
                get("/api/v1/interview/evaluation/my")
                        .principal(authentication)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()")
                .value(0));

        verify(evaluationService)
                .getMyEvaluations(candidateEmail);
    }


    // =========================================================
    // HELPERS
    // =========================================================

    private InterviewEvaluationResponse
    createEvaluationResponse(Long id) {

        return InterviewEvaluationResponse.builder()

                .id(id)

                .interviewId(10L)

                .overallScore(85)

                .technicalScore(90)

                .communicationScore(80)

                .confidenceScore(85)

                .strengths(
                        "Good technical knowledge"
                )

                .weaknesses(
                        "Needs more system design experience"
                )

                .feedback(
                        "Good overall interview performance"
                )

                .recommendation(
                        "Recommended"
                )

                .createdAt(
                        LocalDateTime.of(
                                2026,
                                8,
                                17,
                                10,
                                30
                        )
                )

                .build();
    }
}