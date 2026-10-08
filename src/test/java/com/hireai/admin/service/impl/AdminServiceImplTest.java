package com.hireai.admin.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.hireai.admin.dto.response.AdminDashboardResponse;
import com.hireai.admin.dto.response.AdminUserResponse;
import com.hireai.application.entity.Application;
import com.hireai.application.entity.ApplicationStatus;
import com.hireai.application.repository.ApplicationRepository;
import com.hireai.job.entity.Job;
import com.hireai.job.enums.JobStatus;
import com.hireai.job.repository.JobRepository;
import com.hireai.match.entity.JobMatch;
import com.hireai.match.repository.JobMatchRepository;
import com.hireai.resume.repository.ResumeRepository;
import com.hireai.user.entity.User;
import com.hireai.user.enums.Role;
import com.hireai.user.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class AdminServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JobRepository jobRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private ResumeRepository resumeRepository;

    @Mock
    private JobMatchRepository jobMatchRepository;

    @InjectMocks
    private AdminServiceImpl adminService;

    private User candidate;
    private User hr;
    private User admin;

    @BeforeEach
    void setUp() {

        candidate = User.builder()
                .id(1L)
                .firstName("John")
                .lastName("Candidate")
                .email("candidate@test.com")
                .role(Role.CANDIDATE)
                .phone("9999999999")
                .location("Bhubaneswar")
                .headline("Java Developer")
                .experience(0)
                .createdAt(LocalDateTime.now())
                .build();

        hr = User.builder()
                .id(2L)
                .firstName("Jane")
                .lastName("HR")
                .email("hr@test.com")
                .role(Role.HR)
                .phone("8888888888")
                .location("Bangalore")
                .headline("HR Manager")
                .experience(5)
                .createdAt(LocalDateTime.now())
                .build();

        admin = User.builder()
                .id(3L)
                .firstName("Admin")
                .lastName("User")
                .email("admin@test.com")
                .role(Role.ADMIN)
                .createdAt(LocalDateTime.now())
                .build();
    }

    // =========================================================
    // GET DASHBOARD
    // =========================================================

    @Test
    void getDashboard_ShouldReturnCorrectStatistics() {

        Job openJob = Job.builder()
                .id(101L)
                .title("Java Developer")
                .status(JobStatus.OPEN)
                .build();

        Job closedJob = Job.builder()
                .id(102L)
                .title("Python Developer")
                .status(JobStatus.CLOSED)
                .build();

        Application appliedApplication =
                Application.builder()
                        .id(201L)
                        .status(ApplicationStatus.APPLIED)
                        .build();

        Application shortlistedApplication =
                Application.builder()
                        .id(202L)
                        .status(ApplicationStatus.SHORTLISTED)
                        .build();

        Application interviewApplication =
                Application.builder()
                        .id(203L)
                        .status(ApplicationStatus.INTERVIEW)
                        .build();

        Application hiredApplication =
                Application.builder()
                        .id(204L)
                        .status(ApplicationStatus.HIRED)
                        .build();

        Application rejectedApplication =
                Application.builder()
                        .id(205L)
                        .status(ApplicationStatus.REJECTED)
                        .build();

        JobMatch match1 =
                JobMatch.builder()
                        .id(301L)
                        .matchScore(85)
                        .build();

        JobMatch match2 =
                JobMatch.builder()
                        .id(302L)
                        .matchScore(95)
                        .build();

        JobMatch matchWithoutScore =
                JobMatch.builder()
                        .id(303L)
                        .matchScore(null)
                        .build();

        when(userRepository.findAll())
                .thenReturn(List.of(
                        candidate,
                        hr,
                        admin
                ));

        when(jobRepository.findAll())
                .thenReturn(List.of(
                        openJob,
                        closedJob
                ));

        when(applicationRepository.findAll())
                .thenReturn(List.of(
                        appliedApplication,
                        shortlistedApplication,
                        interviewApplication,
                        hiredApplication,
                        rejectedApplication
                ));

        /*
         * AdminServiceImpl uses count() for resumes.
         */
        when(resumeRepository.count())
                .thenReturn(2L);

        /*
         * AdminServiceImpl uses count() for total job matches.
         */
        when(jobMatchRepository.count())
                .thenReturn(3L);

        /*
         * AdminServiceImpl uses findAll() to calculate
         * the average match score.
         */
        when(jobMatchRepository.findAll())
                .thenReturn(List.of(
                        match1,
                        match2,
                        matchWithoutScore
                ));

        AdminDashboardResponse response =
                adminService.getDashboard();

        assertNotNull(response);

        // =====================================================
        // USERS
        // =====================================================

        assertEquals(
                3,
                response.getTotalUsers()
        );

        assertEquals(
                1,
                response.getTotalCandidates()
        );

        assertEquals(
                1,
                response.getTotalHR()
        );

        assertEquals(
                1,
                response.getTotalAdmins()
        );

        // =====================================================
        // JOBS
        // =====================================================

        assertEquals(
                2,
                response.getTotalJobs()
        );

        assertEquals(
                1,
                response.getOpenJobs()
        );

        assertEquals(
                1,
                response.getClosedJobs()
        );

        // =====================================================
        // APPLICATIONS
        // =====================================================

        assertEquals(
                5,
                response.getTotalApplications()
        );

        assertEquals(
                1,
                response.getAppliedApplications()
        );

        assertEquals(
                1,
                response.getShortlistedApplications()
        );

        assertEquals(
                1,
                response.getInterviewApplications()
        );

        assertEquals(
                1,
                response.getHiredApplications()
        );

        assertEquals(
                1,
                response.getRejectedApplications()
        );

        // =====================================================
        // RESUMES
        // =====================================================

        assertEquals(
                2,
                response.getTotalResumes()
        );

        // =====================================================
        // AI MATCHING
        // =====================================================

        assertEquals(
                3,
                response.getTotalJobMatches()
        );

        // (85 + 95) / 2 = 90
        assertEquals(
                90.0,
                response.getAverageMatchScore()
        );

        // =====================================================
        // VERIFY REPOSITORY CALLS
        // =====================================================

        verify(userRepository)
                .findAll();

        verify(jobRepository)
                .findAll();

        verify(applicationRepository)
                .findAll();

        verify(resumeRepository)
                .count();

        verify(jobMatchRepository)
                .count();

        verify(jobMatchRepository)
                .findAll();
    }

    // =========================================================
    // GET DASHBOARD - EMPTY DATABASE
    // =========================================================

    @Test
    void getDashboard_ShouldReturnZeroStatistics_WhenDatabaseIsEmpty() {

        when(userRepository.findAll())
                .thenReturn(List.of());

        when(jobRepository.findAll())
                .thenReturn(List.of());

        when(applicationRepository.findAll())
                .thenReturn(List.of());

        when(resumeRepository.count())
                .thenReturn(0L);

        when(jobMatchRepository.count())
                .thenReturn(0L);

        when(jobMatchRepository.findAll())
                .thenReturn(List.of());

        AdminDashboardResponse response =
                adminService.getDashboard();

        assertNotNull(response);

        assertEquals(
                0,
                response.getTotalUsers()
        );

        assertEquals(
                0,
                response.getTotalCandidates()
        );

        assertEquals(
                0,
                response.getTotalHR()
        );

        assertEquals(
                0,
                response.getTotalAdmins()
        );

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
                response.getTotalApplications()
        );

        assertEquals(
                0,
                response.getAppliedApplications()
        );

        assertEquals(
                0,
                response.getShortlistedApplications()
        );

        assertEquals(
                0,
                response.getInterviewApplications()
        );

        assertEquals(
                0,
                response.getHiredApplications()
        );

        assertEquals(
                0,
                response.getRejectedApplications()
        );

        assertEquals(
                0,
                response.getTotalResumes()
        );

        assertEquals(
                0,
                response.getTotalJobMatches()
        );

        assertEquals(
                0.0,
                response.getAverageMatchScore()
        );
    }

    // =========================================================
    // GET ALL USERS
    // =========================================================

    @Test
    void getAllUsers_ShouldReturnAllUsers() {

        when(userRepository.findAll())
                .thenReturn(List.of(
                        candidate,
                        hr,
                        admin
                ));

        List<AdminUserResponse> responses =
                adminService.getAllUsers();

        assertNotNull(responses);

        assertEquals(
                3,
                responses.size()
        );

        assertEquals(
                1L,
                responses.get(0).getId()
        );

        assertEquals(
                "John",
                responses.get(0).getFirstName()
        );

        assertEquals(
                "Candidate",
                responses.get(0).getLastName()
        );

        assertEquals(
                "candidate@test.com",
                responses.get(0).getEmail()
        );

        assertEquals(
                "CANDIDATE",
                responses.get(0).getRole()
        );

        assertEquals(
                0,
                responses.get(0).getExperience()
        );

        assertEquals(
                "HR",
                responses.get(1).getRole()
        );

        assertEquals(
                "ADMIN",
                responses.get(2).getRole()
        );

        verify(userRepository)
                .findAll();
    }

    // =========================================================
    // GET ALL USERS - EMPTY
    // =========================================================

    @Test
    void getAllUsers_ShouldReturnEmptyList_WhenNoUsersExist() {

        when(userRepository.findAll())
                .thenReturn(List.of());

        List<AdminUserResponse> responses =
                adminService.getAllUsers();

        assertNotNull(responses);

        assertTrue(
                responses.isEmpty()
        );

        verify(userRepository)
                .findAll();
    }

    // =========================================================
    // GET USER BY ID
    // =========================================================

    @Test
    void getUserById_ShouldReturnUser_WhenUserExists() {

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(candidate));

        AdminUserResponse response =
                adminService.getUserById(1L);

        assertNotNull(response);

        assertEquals(
                1L,
                response.getId()
        );

        assertEquals(
                "John",
                response.getFirstName()
        );

        assertEquals(
                "Candidate",
                response.getLastName()
        );

        assertEquals(
                "candidate@test.com",
                response.getEmail()
        );

        assertEquals(
                "CANDIDATE",
                response.getRole()
        );

        assertEquals(
                "9999999999",
                response.getPhone()
        );

        assertEquals(
                "Bhubaneswar",
                response.getLocation()
        );

        assertEquals(
                "Java Developer",
                response.getHeadline()
        );

        assertEquals(
                0,
                response.getExperience()
        );

        assertNotNull(
                response.getCreatedAt()
        );

        verify(userRepository)
                .findById(1L);
    }

    // =========================================================
    // GET USER BY ID - NOT FOUND
    // =========================================================

    @Test
    void getUserById_ShouldThrowException_WhenUserDoesNotExist() {

        when(userRepository.findById(999L))
                .thenReturn(Optional.empty());

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> adminService.getUserById(999L)
                );

        assertEquals(
                "User not found with id: 999",
                exception.getMessage()
        );

        verify(userRepository)
                .findById(999L);
    }

    // =========================================================
    // DELETE USER
    // =========================================================

    @Test
    void deleteUser_ShouldDeleteUser_WhenUserExistsAndIsNotAdmin() {

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(candidate));

        adminService.deleteUser(1L);

        verify(userRepository)
                .delete(candidate);
    }

    // =========================================================
    // DELETE HR
    // =========================================================

    @Test
    void deleteUser_ShouldDeleteHR_WhenHRExists() {

        when(userRepository.findById(2L))
                .thenReturn(Optional.of(hr));

        adminService.deleteUser(2L);

        verify(userRepository)
                .delete(hr);
    }

    // =========================================================
    // DELETE ADMIN - PROTECTED
    // =========================================================

    @Test
    void deleteUser_ShouldThrowException_WhenUserIsAdmin() {

        when(userRepository.findById(3L))
                .thenReturn(Optional.of(admin));

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> adminService.deleteUser(3L)
                );

        assertEquals(
                "Admin users cannot be deleted.",
                exception.getMessage()
        );

        verify(userRepository, never())
                .delete(admin);
    }

    // =========================================================
    // DELETE USER - NOT FOUND
    // =========================================================

    @Test
    void deleteUser_ShouldThrowException_WhenUserDoesNotExist() {

        when(userRepository.findById(999L))
                .thenReturn(Optional.empty());

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> adminService.deleteUser(999L)
                );

        assertEquals(
                "User not found with id: 999",
                exception.getMessage()
        );

        verify(userRepository, never())
                .delete(any(User.class));
    }
}