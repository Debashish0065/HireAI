package com.hireai.application.service.impl;

import com.hireai.application.dto.request.ApplyJobRequest;
import com.hireai.application.dto.request.UpdateApplicationStatusRequest;
import com.hireai.application.dto.response.ApplicationResponse;
import com.hireai.application.entity.Application;
import com.hireai.application.entity.ApplicationStatus;
import com.hireai.application.repository.ApplicationRepository;
import com.hireai.job.entity.Job;
import com.hireai.job.enums.JobStatus;
import com.hireai.job.repository.JobRepository;
import com.hireai.notification.service.NotificationService;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceImplTest {

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JobRepository jobRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ApplicationServiceImpl applicationService;

    private User candidate;
    private User hr;
    private Job job;
    private Application application;

    @BeforeEach
    void setUp() {

        candidate = User.builder()
                .id(1L)
                .firstName("Test")
                .lastName("Candidate")
                .email("candidate@gmail.com")
                .role(Role.CANDIDATE)
                .build();

        hr = User.builder()
                .id(2L)
                .firstName("Test")
                .lastName("HR")
                .email("hr@gmail.com")
                .role(Role.HR)
                .build();

        job = Job.builder()
                .id(10L)
                .title("Java Developer")
                .companyName("HireAI")
                .location("Bangalore")
                .status(JobStatus.OPEN)
                .hr(hr)
                .build();

        application = Application.builder()
                .id(100L)
                .candidate(candidate)
                .job(job)
                .status(ApplicationStatus.APPLIED)
                .build();
    }


    // =========================================================
    // 1. APPLY JOB - SUCCESS
    // =========================================================

    @Test
    void applyJob_ShouldCreateApplication_WhenValid() {

        ApplyJobRequest request = new ApplyJobRequest();
        request.setJobId(10L);

        when(userRepository.findByEmail("candidate@gmail.com"))
                .thenReturn(Optional.of(candidate));

        when(jobRepository.findById(10L))
                .thenReturn(Optional.of(job));

        when(applicationRepository.existsByCandidateAndJob(candidate, job))
                .thenReturn(false);

        when(applicationRepository.save(any(Application.class)))
                .thenReturn(application);

        ApplicationResponse response =
                applicationService.applyJob(
                        request,
                        "candidate@gmail.com"
                );

        assertNotNull(response);

        verify(applicationRepository)
                .save(any(Application.class));

        verify(notificationService, times(2))
                .createNotification(any());

        verify(userRepository)
                .findByEmail("candidate@gmail.com");

        verify(jobRepository)
                .findById(10L);
    }


    // =========================================================
    // 2. APPLY JOB - CANDIDATE NOT FOUND
    // =========================================================

    @Test
    void applyJob_ShouldThrowException_WhenCandidateNotFound() {

        ApplyJobRequest request = new ApplyJobRequest();
        request.setJobId(10L);

        when(userRepository.findByEmail("candidate@gmail.com"))
                .thenReturn(Optional.empty());

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> applicationService.applyJob(
                                request,
                                "candidate@gmail.com"
                        )
                );

        assertEquals(
                "Candidate not found",
                exception.getMessage()
        );

        verify(applicationRepository, never())
                .save(any(Application.class));
    }


    // =========================================================
    // 3. APPLY JOB - JOB NOT FOUND
    // =========================================================

    @Test
    void applyJob_ShouldThrowException_WhenJobNotFound() {

        ApplyJobRequest request = new ApplyJobRequest();
        request.setJobId(10L);

        when(userRepository.findByEmail("candidate@gmail.com"))
                .thenReturn(Optional.of(candidate));

        when(jobRepository.findById(10L))
                .thenReturn(Optional.empty());

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> applicationService.applyJob(
                                request,
                                "candidate@gmail.com"
                        )
                );

        assertEquals(
                "Job not found",
                exception.getMessage()
        );
    }


    // =========================================================
    // 4. APPLY JOB - CLOSED JOB
    // =========================================================

    @Test
    void applyJob_ShouldThrowException_WhenJobIsClosed() {

        ApplyJobRequest request = new ApplyJobRequest();
        request.setJobId(10L);

        job.setStatus(JobStatus.CLOSED);

        when(userRepository.findByEmail("candidate@gmail.com"))
                .thenReturn(Optional.of(candidate));

        when(jobRepository.findById(10L))
                .thenReturn(Optional.of(job));

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> applicationService.applyJob(
                                request,
                                "candidate@gmail.com"
                        )
                );

        assertEquals(
                "You cannot apply for a closed job.",
                exception.getMessage()
        );

        verify(applicationRepository, never())
                .save(any(Application.class));
    }


    // =========================================================
    // 5. APPLY JOB - DUPLICATE APPLICATION
    // =========================================================

    @Test
    void applyJob_ShouldThrowException_WhenAlreadyApplied() {

        ApplyJobRequest request = new ApplyJobRequest();
        request.setJobId(10L);

        when(userRepository.findByEmail("candidate@gmail.com"))
                .thenReturn(Optional.of(candidate));

        when(jobRepository.findById(10L))
                .thenReturn(Optional.of(job));

        when(applicationRepository.existsByCandidateAndJob(candidate, job))
                .thenReturn(true);

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> applicationService.applyJob(
                                request,
                                "candidate@gmail.com"
                        )
                );

        assertEquals(
                "You have already applied for this job.",
                exception.getMessage()
        );
    }


    // =========================================================
    // 6. GET MY APPLICATIONS
    // =========================================================

    @Test
    void getMyApplications_ShouldReturnApplications_WhenCandidateExists() {

        when(userRepository.findByEmail("candidate@gmail.com"))
                .thenReturn(Optional.of(candidate));

        when(applicationRepository.findByCandidate(candidate))
                .thenReturn(List.of(application));

        List<ApplicationResponse> responses =
                applicationService.getMyApplications(
                        "candidate@gmail.com"
                );

        assertNotNull(responses);
        assertEquals(1, responses.size());

        assertEquals(
                100L,
                responses.get(0).getId()
        );

        assertEquals(
                "Java Developer",
                responses.get(0).getJobTitle()
        );

        assertEquals(
                "APPLIED",
                responses.get(0).getStatus()
        );
    }


    // =========================================================
    // 7. GET MY APPLICATION BY ID
    // =========================================================

    @Test
    void getMyApplicationById_ShouldReturnApplication_WhenFound() {

        when(userRepository.findByEmail("candidate@gmail.com"))
                .thenReturn(Optional.of(candidate));

        when(applicationRepository.findByIdAndCandidate(
                100L,
                candidate
        )).thenReturn(Optional.of(application));

        ApplicationResponse response =
                applicationService.getMyApplicationById(
                        100L,
                        "candidate@gmail.com"
                );

        assertNotNull(response);

        assertEquals(
                100L,
                response.getId()
        );

        assertEquals(
                "Java Developer",
                response.getJobTitle()
        );
    }


    // =========================================================
    // 8. WITHDRAW APPLICATION
    // =========================================================

    @Test
    void withdrawApplication_ShouldDeleteApplication_WhenAllowed() {

        when(userRepository.findByEmail("candidate@gmail.com"))
                .thenReturn(Optional.of(candidate));

        when(applicationRepository.findByIdAndCandidate(
                100L,
                candidate
        )).thenReturn(Optional.of(application));

        applicationService.withdrawApplication(
                100L,
                "candidate@gmail.com"
        );

        verify(applicationRepository)
                .delete(application);
    }


    // =========================================================
    // 9. WITHDRAW - HIRED APPLICATION
    // =========================================================

    @Test
    void withdrawApplication_ShouldThrowException_WhenApplicationIsHired() {

        application.setStatus(ApplicationStatus.HIRED);

        when(userRepository.findByEmail("candidate@gmail.com"))
                .thenReturn(Optional.of(candidate));

        when(applicationRepository.findByIdAndCandidate(
                100L,
                candidate
        )).thenReturn(Optional.of(application));

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> applicationService.withdrawApplication(
                                100L,
                                "candidate@gmail.com"
                        )
                );

        assertEquals(
                "You cannot withdraw a hired application.",
                exception.getMessage()
        );

        verify(applicationRepository, never())
                .delete(any(Application.class));
    }


    // =========================================================
    // 10. HAS APPLIED - TRUE
    // =========================================================

    @Test
    void hasApplied_ShouldReturnTrue_WhenAlreadyApplied() {

        when(userRepository.findByEmail("candidate@gmail.com"))
                .thenReturn(Optional.of(candidate));

        when(jobRepository.findById(10L))
                .thenReturn(Optional.of(job));

        when(applicationRepository.existsByCandidateAndJob(
                candidate,
                job
        )).thenReturn(true);

        boolean result =
                applicationService.hasApplied(
                        10L,
                        "candidate@gmail.com"
                );

        assertTrue(result);
    }


    // =========================================================
    // 11. HAS APPLIED - FALSE
    // =========================================================

    @Test
    void hasApplied_ShouldReturnFalse_WhenNotApplied() {

        when(userRepository.findByEmail("candidate@gmail.com"))
                .thenReturn(Optional.of(candidate));

        when(jobRepository.findById(10L))
                .thenReturn(Optional.of(job));

        when(applicationRepository.existsByCandidateAndJob(
                candidate,
                job
        )).thenReturn(false);

        boolean result =
                applicationService.hasApplied(
                        10L,
                        "candidate@gmail.com"
                );

        assertFalse(result);
    }


    // =========================================================
    // 12. HR - GET ALL APPLICANTS
    // =========================================================

    @Test
    void getApplicantsForHR_ShouldReturnApplications_WhenHRExists() {

        when(userRepository.findByEmail("hr@gmail.com"))
                .thenReturn(Optional.of(hr));

        when(applicationRepository.findByJobHr(hr))
                .thenReturn(List.of(application));

        List<ApplicationResponse> responses =
                applicationService.getApplicantsForHR(
                        "hr@gmail.com"
                );

        assertNotNull(responses);

        assertEquals(
                1,
                responses.size()
        );

        assertEquals(
                100L,
                responses.get(0).getId()
        );
    }


    // =========================================================
    // 13. HR - GET APPLICANTS FOR JOB
    // =========================================================

    @Test
    void getApplicantsForHRJob_ShouldReturnApplications_WhenHROwnsJob() {

        when(userRepository.findByEmail("hr@gmail.com"))
                .thenReturn(Optional.of(hr));

        when(jobRepository.findById(10L))
                .thenReturn(Optional.of(job));

        when(applicationRepository.findByJob(job))
                .thenReturn(List.of(application));

        List<ApplicationResponse> responses =
                applicationService.getApplicantsForHRJob(
                        10L,
                        "hr@gmail.com"
                );

        assertNotNull(responses);

        assertEquals(
                1,
                responses.size()
        );

        assertEquals(
                "candidate@gmail.com",
                responses.get(0).getCandidateEmail()
        );
    }


    // =========================================================
    // 14. HR - UPDATE STATUS
    // =========================================================

    @Test
    void updateStatus_ShouldUpdateApplication_WhenHROwnsJob() {

        UpdateApplicationStatusRequest request =
                new UpdateApplicationStatusRequest();

        request.setStatus("SHORTLISTED");

        when(userRepository.findByEmail("hr@gmail.com"))
                .thenReturn(Optional.of(hr));

        when(applicationRepository.findById(100L))
                .thenReturn(Optional.of(application));

        when(applicationRepository.save(application))
                .thenReturn(application);

        ApplicationResponse response =
                applicationService.updateStatus(
                        100L,
                        request,
                        "hr@gmail.com"
                );

        assertNotNull(response);

        assertEquals(
                ApplicationStatus.SHORTLISTED,
                application.getStatus()
        );

        verify(applicationRepository)
                .save(application);

        verify(notificationService)
                .createNotification(any());
    }
}