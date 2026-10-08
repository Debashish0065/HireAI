package com.hireai.candidate.service.impl;

import com.hireai.application.entity.Application;
import com.hireai.application.entity.ApplicationStatus;
import com.hireai.application.repository.ApplicationRepository;

import com.hireai.candidate.dto.response.CandidateDashboardResponse;

import com.hireai.interview.entity.Interview;
import com.hireai.interview.enums.InterviewStatus;
import com.hireai.interview.repository.InterviewRepository;

import com.hireai.user.entity.User;
import com.hireai.user.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CandidateDashboardServiceImplTest {

    // =========================================================
    // MOCK REPOSITORIES
    // =========================================================

    @Mock
    private UserRepository userRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private InterviewRepository interviewRepository;

    // =========================================================
    // SERVICE
    // =========================================================

    @InjectMocks
    private CandidateDashboardServiceImpl candidateDashboardService;

    // =========================================================
    // TEST DATA
    // =========================================================

    private final String candidateEmail =
            "candidate@gmail.com";

    private User candidate;

    // =========================================================
    // SETUP
    // =========================================================

    @BeforeEach
    void setUp() {

        candidate =
                User.builder()
                        .id(1L)
                        .firstName("Debashis")
                        .lastName("Satapathy")
                        .email(candidateEmail)
                        .build();
    }

    // =========================================================
    // HELPER - APPLICATION
    // =========================================================

    private Application createApplication(
            ApplicationStatus status
    ) {

        Application application =
                new Application();

        application.setStatus(status);

        application.setCandidate(candidate);

        return application;
    }

    // =========================================================
    // HELPER - INTERVIEW
    // =========================================================

    private Interview createInterview(
            InterviewStatus status,
            Integer score
    ) {

        Interview interview =
                new Interview();

        interview.setStatus(status);

        interview.setScore(score);

        interview.setCandidate(candidate);

        return interview;
    }

    // =========================================================
    // TEST 1
    // COMPLETE DASHBOARD
    // =========================================================

    @Test
    void getDashboard_ShouldCalculateAllStatisticsCorrectly() {

        // =====================================================
        // USER
        // =====================================================

        when(
                userRepository.findByEmail(
                        candidateEmail
                )
        ).thenReturn(
                Optional.of(candidate)
        );

        // =====================================================
        // APPLICATIONS
        // =====================================================

        Application applied =
                createApplication(
                        ApplicationStatus.APPLIED
                );

        Application shortlisted =
                createApplication(
                        ApplicationStatus.SHORTLISTED
                );

        Application interview =
                createApplication(
                        ApplicationStatus.INTERVIEW
                );

        Application hired =
                createApplication(
                        ApplicationStatus.HIRED
                );

        Application rejected =
                createApplication(
                        ApplicationStatus.REJECTED
                );

        Application applied2 =
                createApplication(
                        ApplicationStatus.APPLIED
                );

        Application shortlisted2 =
                createApplication(
                        ApplicationStatus.SHORTLISTED
                );

        List<Application> applications =
                List.of(
                        applied,
                        shortlisted,
                        interview,
                        hired,
                        rejected,
                        applied2,
                        shortlisted2
                );

        when(
                applicationRepository.findByCandidate(
                        candidate
                )
        ).thenReturn(applications);

        // =====================================================
        // INTERVIEWS
        // =====================================================

        Interview completed1 =
                createInterview(
                        InterviewStatus.COMPLETED,
                        80
                );

        Interview completed2 =
                createInterview(
                        InterviewStatus.COMPLETED,
                        90
                );

        Interview scheduled =
                createInterview(
                        InterviewStatus.NOT_STARTED,
                        70
                );

        Interview completedWithoutScore =
                createInterview(
                        InterviewStatus.COMPLETED,
                        null
                );

        List<Interview> interviews =
                List.of(
                        completed1,
                        completed2,
                        scheduled,
                        completedWithoutScore
                );

        when(
                interviewRepository.findByCandidate(
                        candidate
                )
        ).thenReturn(interviews);

        // =====================================================
        // EXECUTE
        // =====================================================

        CandidateDashboardResponse response =
                candidateDashboardService.getDashboard(
                        candidateEmail
                );

        // =====================================================
        // APPLICATION ASSERTIONS
        // =====================================================

        assertNotNull(response);

        assertEquals(
                7,
                response.getTotalApplications()
        );

        assertEquals(
                2,
                response.getApplied()
        );

        assertEquals(
                2,
                response.getShortlisted()
        );

        assertEquals(
                1,
                response.getInterview()
        );

        assertEquals(
                1,
                response.getHired()
        );

        assertEquals(
                1,
                response.getRejected()
        );

        // =====================================================
        // INTERVIEW ASSERTIONS
        // =====================================================

        assertEquals(
                4,
                response.getTotalInterviews()
        );

        assertEquals(
                3,
                response.getCompletedInterviews()
        );

        /*
         * Scores:
         *
         * 80
         * 90
         * 70
         *
         * Average = 80.0
         *
         * null score is ignored.
         */

        assertEquals(
                80.0,
                response.getAverageInterviewScore()
        );

        // =====================================================
        // VERIFY
        // =====================================================

        verify(userRepository)
                .findByEmail(candidateEmail);

        verify(applicationRepository)
                .findByCandidate(candidate);

        verify(interviewRepository)
                .findByCandidate(candidate);
    }

    // =========================================================
    // TEST 2
    // CANDIDATE NOT FOUND
    // =========================================================

    @Test
    void getDashboard_ShouldThrowException_WhenCandidateNotFound() {

        when(
                userRepository.findByEmail(
                        candidateEmail
                )
        ).thenReturn(Optional.empty());

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () ->
                                candidateDashboardService
                                        .getDashboard(
                                                candidateEmail
                                        )
                );

        assertEquals(
                "Candidate not found",
                exception.getMessage()
        );

        verify(
                applicationRepository,
                never()
        ).findByCandidate(any());

        verify(
                interviewRepository,
                never()
        ).findByCandidate(any());
    }

    // =========================================================
    // TEST 3
    // NO APPLICATIONS / NO INTERVIEWS
    // =========================================================

    @Test
    void getDashboard_ShouldReturnZeroStatistics_WhenNoDataExists() {

        when(
                userRepository.findByEmail(
                        candidateEmail
                )
        ).thenReturn(Optional.of(candidate));

        when(
                applicationRepository.findByCandidate(
                        candidate
                )
        ).thenReturn(List.of());

        when(
                interviewRepository.findByCandidate(
                        candidate
                )
        ).thenReturn(List.of());

        CandidateDashboardResponse response =
                candidateDashboardService.getDashboard(
                        candidateEmail
                );

        assertNotNull(response);

        assertEquals(
                0,
                response.getTotalApplications()
        );

        assertEquals(
                0,
                response.getApplied()
        );

        assertEquals(
                0,
                response.getShortlisted()
        );

        assertEquals(
                0,
                response.getInterview()
        );

        assertEquals(
                0,
                response.getHired()
        );

        assertEquals(
                0,
                response.getRejected()
        );

        assertEquals(
                0,
                response.getTotalInterviews()
        );

        assertEquals(
                0,
                response.getCompletedInterviews()
        );

        assertEquals(
                0.0,
                response.getAverageInterviewScore()
        );

        verify(applicationRepository)
                .findByCandidate(candidate);

        verify(interviewRepository)
                .findByCandidate(candidate);
    }

    // =========================================================
    // TEST 4
    // AVERAGE SCORE
    // =========================================================

    @Test
    void getDashboard_ShouldCalculateAverageInterviewScoreCorrectly() {

        when(
                userRepository.findByEmail(
                        candidateEmail
                )
        ).thenReturn(Optional.of(candidate));

        when(
                applicationRepository.findByCandidate(
                        candidate
                )
        ).thenReturn(List.of());

        Interview interview1 =
                createInterview(
                        InterviewStatus.COMPLETED,
                        75
                );

        Interview interview2 =
                createInterview(
                        InterviewStatus.COMPLETED,
                        80
                );

        Interview interview3 =
                createInterview(
                        InterviewStatus.COMPLETED,
                        95
                );

        when(
                interviewRepository.findByCandidate(
                        candidate
                )
        ).thenReturn(
                List.of(
                        interview1,
                        interview2,
                        interview3
                )
        );

        CandidateDashboardResponse response =
                candidateDashboardService.getDashboard(
                        candidateEmail
                );

        /*
         * Average:
         *
         * (75 + 80 + 95) / 3
         * = 250 / 3
         * = 83.333...
         *
         * Rounded to 2 decimals = 83.33
         */

        assertEquals(
                83.33,
                response.getAverageInterviewScore(),
                0.001
        );

        assertEquals(
                3,
                response.getTotalInterviews()
        );

        assertEquals(
                3,
                response.getCompletedInterviews()
        );
    }

    // =========================================================
    // TEST 5
    // NULL SCORES SHOULD BE IGNORED
    // =========================================================

    @Test
    void getDashboard_ShouldIgnoreNullInterviewScores() {

        when(
                userRepository.findByEmail(
                        candidateEmail
                )
        ).thenReturn(Optional.of(candidate));

        when(
                applicationRepository.findByCandidate(
                        candidate
                )
        ).thenReturn(List.of());

        Interview interview1 =
                createInterview(
                        InterviewStatus.COMPLETED,
                        80
                );

        Interview interview2 =
                createInterview(
                        InterviewStatus.COMPLETED,
                        null
                );

        Interview interview3 =
                createInterview(
                        InterviewStatus.COMPLETED,
                        60
                );

        when(
                interviewRepository.findByCandidate(
                        candidate
                )
        ).thenReturn(
                List.of(
                        interview1,
                        interview2,
                        interview3
                )
        );

        CandidateDashboardResponse response =
                candidateDashboardService.getDashboard(
                        candidateEmail
                );

        /*
         * Only non-null scores are included:
         *
         * 80 + 60
         * -------- = 70
         *    2
         */

        assertEquals(
                70.0,
                response.getAverageInterviewScore()
        );

        assertEquals(
                3,
                response.getTotalInterviews()
        );

        assertEquals(
                3,
                response.getCompletedInterviews()
        );
    }

    // =========================================================
    // TEST 6
    // APPLICATION STATUS COUNTS
    // =========================================================

    @Test
    void getDashboard_ShouldCountApplicationStatusesCorrectly() {

        when(
                userRepository.findByEmail(
                        candidateEmail
                )
        ).thenReturn(Optional.of(candidate));

        List<Application> applications =
                List.of(
                        createApplication(
                                ApplicationStatus.APPLIED
                        ),
                        createApplication(
                                ApplicationStatus.APPLIED
                        ),
                        createApplication(
                                ApplicationStatus.APPLIED
                        ),
                        createApplication(
                                ApplicationStatus.SHORTLISTED
                        ),
                        createApplication(
                                ApplicationStatus.INTERVIEW
                        ),
                        createApplication(
                                ApplicationStatus.INTERVIEW
                        ),
                        createApplication(
                                ApplicationStatus.HIRED
                        ),
                        createApplication(
                                ApplicationStatus.REJECTED
                        ),
                        createApplication(
                                ApplicationStatus.REJECTED
                        )
                );

        when(
                applicationRepository.findByCandidate(
                        candidate
                )
        ).thenReturn(applications);

        when(
                interviewRepository.findByCandidate(
                        candidate
                )
        ).thenReturn(List.of());

        CandidateDashboardResponse response =
                candidateDashboardService.getDashboard(
                        candidateEmail
                );

        assertEquals(
                9,
                response.getTotalApplications()
        );

        assertEquals(
                3,
                response.getApplied()
        );

        assertEquals(
                1,
                response.getShortlisted()
        );

        assertEquals(
                2,
                response.getInterview()
        );

        assertEquals(
                1,
                response.getHired()
        );

        assertEquals(
                2,
                response.getRejected()
        );

        assertEquals(
                0,
                response.getTotalInterviews()
        );

        assertEquals(
                0.0,
                response.getAverageInterviewScore()
        );
    }
}