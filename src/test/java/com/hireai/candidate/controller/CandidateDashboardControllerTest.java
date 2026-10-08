package com.hireai.candidate.controller;

import com.hireai.candidate.dto.response.CandidateDashboardResponse;
import com.hireai.candidate.service.CandidateDashboardService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.security.core.Authentication;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CandidateDashboardControllerTest {

    // =========================================================
    // MOCK SERVICE
    // =========================================================

    @Mock
    private CandidateDashboardService candidateDashboardService;

    // =========================================================
    // MOCK AUTHENTICATION
    // =========================================================

    @Mock
    private Authentication authentication;

    // =========================================================
    // CONTROLLER
    // =========================================================

    private CandidateDashboardController candidateDashboardController;

    // =========================================================
    // TEST DATA
    // =========================================================

    private final String candidateEmail =
            "candidate@gmail.com";

    // =========================================================
    // SETUP
    // =========================================================

    @BeforeEach
    void setUp() {

        candidateDashboardController =
                new CandidateDashboardController(
                        candidateDashboardService
                );
    }

    // =========================================================
    // HELPER - CREATE RESPONSE
    // =========================================================

    private CandidateDashboardResponse createResponse() {

        return CandidateDashboardResponse.builder()

                .totalApplications(10)

                .applied(3)

                .shortlisted(2)

                .interview(2)

                .hired(1)

                .rejected(2)

                .totalInterviews(4)

                .completedInterviews(3)

                .averageInterviewScore(82.50)

                .build();
    }

    // =========================================================
    // TEST 1
    // GET DASHBOARD SUCCESSFULLY
    // =========================================================

    @Test
    void getDashboard_ShouldReturnCandidateDashboard() {

        // Authentication is used by controller.
        when(authentication.getName())
                .thenReturn(candidateEmail);

        CandidateDashboardResponse response =
                createResponse();

        when(
                candidateDashboardService.getDashboard(
                        candidateEmail
                )
        ).thenReturn(response);

        CandidateDashboardResponse result =
                candidateDashboardController.getDashboard(
                        authentication
                );

        // =====================================================
        // ASSERTIONS
        // =====================================================

        assertNotNull(result);

        assertEquals(
                10,
                result.getTotalApplications()
        );

        assertEquals(
                3,
                result.getApplied()
        );

        assertEquals(
                2,
                result.getShortlisted()
        );

        assertEquals(
                2,
                result.getInterview()
        );

        assertEquals(
                1,
                result.getHired()
        );

        assertEquals(
                2,
                result.getRejected()
        );

        assertEquals(
                4,
                result.getTotalInterviews()
        );

        assertEquals(
                3,
                result.getCompletedInterviews()
        );

        assertEquals(
                82.50,
                result.getAverageInterviewScore()
        );

        // =====================================================
        // VERIFY
        // =====================================================

        verify(authentication)
                .getName();

        verify(candidateDashboardService)
                .getDashboard(candidateEmail);
    }

    // =========================================================
    // TEST 2
    // VERIFY CORRECT EMAIL IS PASSED
    // =========================================================

    @Test
    void getDashboard_ShouldPassAuthenticatedEmailToService() {

        when(authentication.getName())
                .thenReturn(candidateEmail);

        CandidateDashboardResponse response =
                CandidateDashboardResponse.builder()
                        .totalApplications(0)
                        .applied(0)
                        .shortlisted(0)
                        .interview(0)
                        .hired(0)
                        .rejected(0)
                        .totalInterviews(0)
                        .completedInterviews(0)
                        .averageInterviewScore(0.0)
                        .build();

        when(
                candidateDashboardService.getDashboard(
                        candidateEmail
                )
        ).thenReturn(response);

        candidateDashboardController.getDashboard(
                authentication
        );

        verify(candidateDashboardService)
                .getDashboard(candidateEmail);

        verify(authentication)
                .getName();
    }

    // =========================================================
    // TEST 3
    // EMPTY DASHBOARD
    // =========================================================

    @Test
    void getDashboard_ShouldReturnEmptyDashboard() {

        when(authentication.getName())
                .thenReturn(candidateEmail);

        CandidateDashboardResponse response =
                CandidateDashboardResponse.builder()
                        .totalApplications(0)
                        .applied(0)
                        .shortlisted(0)
                        .interview(0)
                        .hired(0)
                        .rejected(0)
                        .totalInterviews(0)
                        .completedInterviews(0)
                        .averageInterviewScore(0.0)
                        .build();

        when(
                candidateDashboardService.getDashboard(
                        candidateEmail
                )
        ).thenReturn(response);

        CandidateDashboardResponse result =
                candidateDashboardController.getDashboard(
                        authentication
                );

        assertNotNull(result);

        assertEquals(
                0,
                result.getTotalApplications()
        );

        assertEquals(
                0,
                result.getTotalInterviews()
        );

        assertEquals(
                0.0,
                result.getAverageInterviewScore()
        );

        verify(candidateDashboardService)
                .getDashboard(candidateEmail);
    }

    // =========================================================
    // TEST 4
    // SERVICE EXCEPTION PROPAGATION
    // =========================================================

    @Test
    void getDashboard_ShouldPropagateServiceException() {

        when(authentication.getName())
                .thenReturn(candidateEmail);

        when(
                candidateDashboardService.getDashboard(
                        candidateEmail
                )
        ).thenThrow(
                new RuntimeException(
                        "Candidate not found"
                )
        );

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () ->
                                candidateDashboardController
                                        .getDashboard(
                                                authentication
                                        )
                );

        assertEquals(
                "Candidate not found",
                exception.getMessage()
        );

        verify(candidateDashboardService)
                .getDashboard(candidateEmail);
    }
}