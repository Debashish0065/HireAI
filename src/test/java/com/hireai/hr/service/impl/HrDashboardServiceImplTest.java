package com.hireai.hr.service.impl;

import com.hireai.application.entity.Application;
import com.hireai.application.entity.ApplicationStatus;
import com.hireai.application.repository.ApplicationRepository;

import com.hireai.hr.dto.response.HrDashboardResponse;

import com.hireai.job.entity.Job;
import com.hireai.job.enums.JobStatus;
import com.hireai.job.repository.JobRepository;

import com.hireai.user.entity.User;
import com.hireai.user.enums.Role;
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
class HrDashboardServiceImplTest {

    // =========================================================
    // MOCK REPOSITORIES
    // =========================================================

    @Mock
    private UserRepository userRepository;

    @Mock
    private JobRepository jobRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    // =========================================================
    // SERVICE
    // =========================================================

    @InjectMocks
    private HrDashboardServiceImpl hrDashboardService;

    // =========================================================
    // TEST DATA
    // =========================================================

    private User hr;

    private final String hrEmail =
            "hr@gmail.com";

    // =========================================================
    // SETUP
    // =========================================================

    @BeforeEach
    void setUp() {

        hr =
                User.builder()
                        .id(1L)
                        .firstName("HR")
                        .lastName("Manager")
                        .email(hrEmail)
                        .role(Role.HR)
                        .build();
    }

    // =========================================================
    // HELPER - CREATE JOB
    // =========================================================

    private Job createJob(
            Long id,
            JobStatus status
    ) {

        return Job.builder()
                .id(id)
                .status(status)
                .build();
    }

    // =========================================================
    // HELPER - CREATE APPLICATION
    // =========================================================

    private Application createApplication(
            ApplicationStatus status
    ) {

        Application application =
                new Application();

        application.setStatus(status);

        return application;
    }

    // =========================================================
    // TEST 1
    // HR NOT FOUND
    // =========================================================

    @Test
    void getDashboard_ShouldThrowException_WhenHrNotFound() {

        when(
                userRepository.findByEmail(hrEmail)
        ).thenReturn(Optional.empty());

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> hrDashboardService
                                .getDashboard(hrEmail)
                );

        assertEquals(
                "HR not found",
                exception.getMessage()
        );

        verify(
                jobRepository,
                never()
        ).findByHrId(anyLong());

        verify(
                applicationRepository,
                never()
        ).findByJobHr(any());
    }

    // =========================================================
    // TEST 2
    // CALCULATE JOB STATISTICS
    // =========================================================

    @Test
    void getDashboard_ShouldCalculateJobStatistics() {

        when(
                userRepository.findByEmail(hrEmail)
        ).thenReturn(Optional.of(hr));

        List<Job> jobs =
                List.of(
                        createJob(
                                1L,
                                JobStatus.OPEN
                        ),
                        createJob(
                                2L,
                                JobStatus.OPEN
                        ),
                        createJob(
                                3L,
                                JobStatus.CLOSED
                        )
                );

        when(
                jobRepository.findByHrId(
                        hr.getId()
                )
        ).thenReturn(jobs);

        when(
                applicationRepository.findByJobHr(hr)
        ).thenReturn(List.of());

        HrDashboardResponse response =
                hrDashboardService.getDashboard(
                        hrEmail
                );

        assertNotNull(response);

        assertEquals(
                3,
                response.getTotalJobs()
        );

        assertEquals(
                2,
                response.getOpenJobs()
        );

        assertEquals(
                1,
                response.getClosedJobs()
        );

        verify(jobRepository)
                .findByHrId(hr.getId());
    }

    // =========================================================
    // TEST 3
    // CALCULATE APPLICATION STATISTICS
    // =========================================================

    @Test
    void getDashboard_ShouldCalculateApplicationStatistics() {

        when(
                userRepository.findByEmail(hrEmail)
        ).thenReturn(Optional.of(hr));

        when(
                jobRepository.findByHrId(
                        hr.getId()
                )
        ).thenReturn(List.of());

        List<Application> applications =
                List.of(
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
                                ApplicationStatus.HIRED
                        ),
                        createApplication(
                                ApplicationStatus.REJECTED
                        )
                );

        when(
                applicationRepository.findByJobHr(hr)
        ).thenReturn(applications);

        HrDashboardResponse response =
                hrDashboardService.getDashboard(
                        hrEmail
                );

        assertNotNull(response);

        assertEquals(
                6,
                response.getTotalApplicants()
        );

        assertEquals(
                2,
                response.getApplied()
        );

        assertEquals(
                1,
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

        verify(applicationRepository)
                .findByJobHr(hr);
    }

    // =========================================================
    // TEST 4
    // CALCULATE COMPLETE DASHBOARD
    // =========================================================

    @Test
    void getDashboard_ShouldCalculateCompleteDashboard() {

        when(
                userRepository.findByEmail(hrEmail)
        ).thenReturn(Optional.of(hr));

        List<Job> jobs =
                List.of(
                        createJob(
                                1L,
                                JobStatus.OPEN
                        ),
                        createJob(
                                2L,
                                JobStatus.OPEN
                        ),
                        createJob(
                                3L,
                                JobStatus.CLOSED
                        ),
                        createJob(
                                4L,
                                JobStatus.CLOSED
                        )
                );

        when(
                jobRepository.findByHrId(
                        hr.getId()
                )
        ).thenReturn(jobs);

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
                applicationRepository.findByJobHr(hr)
        ).thenReturn(applications);

        HrDashboardResponse response =
                hrDashboardService.getDashboard(
                        hrEmail
                );

        assertNotNull(response);

        // JOBS
        assertEquals(
                4,
                response.getTotalJobs()
        );

        assertEquals(
                2,
                response.getOpenJobs()
        );

        assertEquals(
                2,
                response.getClosedJobs()
        );

        // APPLICATIONS
        assertEquals(
                10,
                response.getTotalApplicants()
        );

        assertEquals(
                3,
                response.getApplied()
        );

        assertEquals(
                2,
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
    }

    // =========================================================
    // TEST 5
    // EMPTY JOBS AND APPLICATIONS
    // =========================================================

    @Test
    void getDashboard_ShouldReturnZero_WhenNoJobsOrApplications() {

        when(
                userRepository.findByEmail(hrEmail)
        ).thenReturn(Optional.of(hr));

        when(
                jobRepository.findByHrId(
                        hr.getId()
                )
        ).thenReturn(List.of());

        when(
                applicationRepository.findByJobHr(hr)
        ).thenReturn(List.of());

        HrDashboardResponse response =
                hrDashboardService.getDashboard(
                        hrEmail
                );

        assertNotNull(response);

        assertEquals(
                0,
                response.getTotalJobs()
        );

        assertEquals(
                0,
                response.getOpenJobs()
        );

        assertEquals(
                0,
                response.getClosedJobs()
        );

        assertEquals(
                0,
                response.getTotalApplicants()
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
    }

    // =========================================================
    // TEST 6
    // VERIFY REPOSITORIES ARE CALLED
    // =========================================================

    @Test
    void getDashboard_ShouldCallRequiredRepositories() {

        when(
                userRepository.findByEmail(hrEmail)
        ).thenReturn(Optional.of(hr));

        when(
                jobRepository.findByHrId(
                        hr.getId()
                )
        ).thenReturn(List.of());

        when(
                applicationRepository.findByJobHr(hr)
        ).thenReturn(List.of());

        hrDashboardService.getDashboard(
                hrEmail
        );

        verify(userRepository)
                .findByEmail(hrEmail);

        verify(jobRepository)
                .findByHrId(hr.getId());

        verify(applicationRepository)
                .findByJobHr(hr);
    }
}