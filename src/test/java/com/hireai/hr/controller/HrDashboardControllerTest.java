package com.hireai.hr.controller;

import com.hireai.hr.dto.response.HrDashboardResponse;
import com.hireai.hr.service.HrDashboardService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.security.core.Authentication;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HrDashboardControllerTest {

    // =========================================================
    // MOCK SERVICE
    // =========================================================

    @Mock
    private HrDashboardService hrDashboardService;

    // =========================================================
    // MOCK AUTHENTICATION
    // =========================================================

    @Mock
    private Authentication authentication;

    // =========================================================
    // CONTROLLER
    // =========================================================

    private HrDashboardController hrDashboardController;

    // =========================================================
    // TEST DATA
    // =========================================================

    private final String hrEmail =
            "hr@gmail.com";

    // =========================================================
    // SETUP
    // =========================================================

    @BeforeEach
    void setUp() {

        hrDashboardController =
                new HrDashboardController(
                        hrDashboardService
                );
    }

    // =========================================================
    // HELPER - CREATE DASHBOARD RESPONSE
    // =========================================================

    private HrDashboardResponse createDashboardResponse() {

        return HrDashboardResponse.builder()
                .totalJobs(10)
                .openJobs(6)
                .closedJobs(4)
                .totalApplicants(50)
                .applied(20)
                .shortlisted(12)
                .interview(8)
                .hired(5)
                .rejected(5)
                .build();
    }

    // =========================================================
    // TEST 1
    // GET DASHBOARD SUCCESSFULLY
    // =========================================================

    @Test
    void getDashboard_ShouldReturnDashboardSuccessfully() {

        when(authentication.getName())
                .thenReturn(hrEmail);

        HrDashboardResponse response =
                createDashboardResponse();

        when(
                hrDashboardService.getDashboard(
                        hrEmail
                )
        ).thenReturn(response);

        HrDashboardResponse result =
                hrDashboardController.getDashboard(
                        authentication
                );

        assertNotNull(result);

        assertEquals(
                10,
                result.getTotalJobs()
        );

        assertEquals(
                6,
                result.getOpenJobs()
        );

        assertEquals(
                4,
                result.getClosedJobs()
        );

        assertEquals(
                50,
                result.getTotalApplicants()
        );

        assertEquals(
                20,
                result.getApplied()
        );

        assertEquals(
                12,
                result.getShortlisted()
        );

        assertEquals(
                8,
                result.getInterview()
        );

        assertEquals(
                5,
                result.getHired()
        );

        assertEquals(
                5,
                result.getRejected()
        );

        verify(authentication)
                .getName();

        verify(hrDashboardService)
                .getDashboard(hrEmail);
    }

    // =========================================================
    // TEST 2
    // VERIFY CORRECT HR EMAIL
    // =========================================================

    @Test
    void getDashboard_ShouldUseAuthenticatedHrEmail() {

        String authenticatedEmail =
                "manager@gmail.com";

        when(authentication.getName())
                .thenReturn(authenticatedEmail);

        HrDashboardResponse response =
                createDashboardResponse();

        when(
                hrDashboardService.getDashboard(
                        authenticatedEmail
                )
        ).thenReturn(response);

        HrDashboardResponse result =
                hrDashboardController.getDashboard(
                        authentication
                );

        assertNotNull(result);

        verify(authentication)
                .getName();

        verify(hrDashboardService)
                .getDashboard(
                        authenticatedEmail
                );
    }

    // =========================================================
    // TEST 3
    // VERIFY ZERO STATISTICS
    // =========================================================

    @Test
    void getDashboard_ShouldReturnZeroStatistics() {

        when(authentication.getName())
                .thenReturn(hrEmail);

        HrDashboardResponse response =
                HrDashboardResponse.builder()
                        .totalJobs(0)
                        .openJobs(0)
                        .closedJobs(0)
                        .totalApplicants(0)
                        .applied(0)
                        .shortlisted(0)
                        .interview(0)
                        .hired(0)
                        .rejected(0)
                        .build();

        when(
                hrDashboardService.getDashboard(
                        hrEmail
                )
        ).thenReturn(response);

        HrDashboardResponse result =
                hrDashboardController.getDashboard(
                        authentication
                );

        assertNotNull(result);

        assertEquals(
                0,
                result.getTotalJobs()
        );

        assertEquals(
                0,
                result.getOpenJobs()
        );

        assertEquals(
                0,
                result.getClosedJobs()
        );

        assertEquals(
                0,
                result.getTotalApplicants()
        );

        assertEquals(
                0,
                result.getApplied()
        );

        assertEquals(
                0,
                result.getShortlisted()
        );

        assertEquals(
                0,
                result.getInterview()
        );

        assertEquals(
                0,
                result.getHired()
        );

        assertEquals(
                0,
                result.getRejected()
        );

        verify(hrDashboardService)
                .getDashboard(hrEmail);
    }

    // =========================================================
    // TEST 4
    // SERVICE EXCEPTION IS PROPAGATED
    // =========================================================

    @Test
    void getDashboard_ShouldPropagateServiceException() {

        when(authentication.getName())
                .thenReturn(hrEmail);

        when(
                hrDashboardService.getDashboard(
                        hrEmail
                )
        ).thenThrow(
                new RuntimeException(
                        "HR not found"
                )
        );

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> hrDashboardController
                                .getDashboard(authentication)
                );

        assertEquals(
                "HR not found",
                exception.getMessage()
        );

        verify(hrDashboardService)
                .getDashboard(hrEmail);
    }
}