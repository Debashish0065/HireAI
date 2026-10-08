
package com.hireai.job.service.impl;

import com.hireai.application.repository.ApplicationRepository;
import com.hireai.job.dto.request.CreateJobRequest;
import com.hireai.job.dto.response.JobResponse;
import com.hireai.job.entity.Job;
import com.hireai.job.enums.JobStatus;
import com.hireai.job.enums.JobType;
import com.hireai.job.repository.JobRepository;
import com.hireai.user.entity.User;
import com.hireai.user.repository.UserRepository;

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
class JobServiceImplTest {

    @Mock
    private JobRepository jobRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    @InjectMocks
    private JobServiceImpl jobService;


    // =========================================================
    // CREATE JOB
    // =========================================================

    @Test
    void createJob_ShouldCreateJob_WhenHRExists() {

        User hr = User.builder()
                .id(1L)
                .firstName("HR")
                .lastName("User")
                .email("hr@gmail.com")
                .build();

        CreateJobRequest request = new CreateJobRequest();

        request.setTitle("Java Developer");
        request.setDescription("Java Spring Boot Developer");
        request.setCompanyName("HireAI");
        request.setLocation("Bhubaneswar");
        request.setSalary(600000.0);
        request.setJobType(JobType.FULL_TIME);

        Job savedJob = Job.builder()
                .id(1L)
                .title("Java Developer")
                .description("Java Spring Boot Developer")
                .companyName("HireAI")
                .location("Bhubaneswar")
                .salary(600000.0)
                .jobType(JobType.FULL_TIME)
                .status(JobStatus.OPEN)
                .hr(hr)
                .build();

        when(userRepository.findByEmail("hr@gmail.com"))
                .thenReturn(Optional.of(hr));

        when(jobRepository.save(any(Job.class)))
                .thenReturn(savedJob);

        JobResponse response =
                jobService.createJob(
                        request,
                        "hr@gmail.com"
                );

        assertNotNull(response);

        assertEquals(
                1L,
                response.getId()
        );

        assertEquals(
                "Java Developer",
                response.getTitle()
        );

        assertEquals(
                "Java Spring Boot Developer",
                response.getDescription()
        );

        assertEquals(
                "HireAI",
                response.getCompanyName()
        );

        assertEquals(
                "Bhubaneswar",
                response.getLocation()
        );

        assertEquals(
                600000.0,
                response.getSalary()
        );

        assertEquals(
        		JobType.FULL_TIME,
        		response.getJobType());

        assertEquals(
                JobStatus.OPEN,
                response.getStatus()
        );

        verify(userRepository)
                .findByEmail("hr@gmail.com");

        verify(jobRepository)
                .save(any(Job.class));
    }


    // =========================================================
    // CREATE JOB - HR NOT FOUND
    // =========================================================

    @Test
    void createJob_ShouldThrowException_WhenHRDoesNotExist() {

        CreateJobRequest request =
                new CreateJobRequest();

        request.setTitle("Java Developer");

        when(userRepository.findByEmail("missing@gmail.com"))
                .thenReturn(Optional.empty());

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> jobService.createJob(
                                request,
                                "missing@gmail.com"
                        )
                );

        assertEquals(
                "User not found",
                exception.getMessage()
        );

        verify(userRepository)
                .findByEmail("missing@gmail.com");

        verify(jobRepository, never())
                .save(any(Job.class));
    }


    // =========================================================
    // GET ALL JOBS
    // =========================================================

    @Test
    void getAllJobs_ShouldReturnAllJobs() {

        User hr = User.builder()
                .id(1L)
                .firstName("HR")
                .lastName("User")
                .email("hr@gmail.com")
                .build();

        Job job1 = Job.builder()
                .id(1L)
                .title("Java Developer")
                .description("Java job")
                .companyName("HireAI")
                .location("Bhubaneswar")
                .salary(600000.0)
                .jobType(JobType.FULL_TIME)
                .status(JobStatus.OPEN)
                .hr(hr)
                .build();

        Job job2 = Job.builder()
                .id(2L)
                .title("Backend Developer")
                .description("Backend job")
                .companyName("HireAI")
                .location("Remote")
                .salary(700000.0)
                .jobType(JobType.FULL_TIME)
                .status(JobStatus.OPEN)
                .hr(hr)
                .build();

        when(jobRepository.findAll())
                .thenReturn(List.of(job1, job2));

        List<JobResponse> result =
                jobService.getAllJobs();

        assertNotNull(result);
        assertEquals(2, result.size());

        assertEquals(
                "Java Developer",
                result.get(0).getTitle()
        );

        assertEquals(
                "Backend Developer",
                result.get(1).getTitle()
        );

        verify(jobRepository)
                .findAll();
    }


    // =========================================================
    // GET ALL JOBS - EMPTY
    // =========================================================

    @Test
    void getAllJobs_ShouldReturnEmptyList_WhenNoJobsExist() {

        when(jobRepository.findAll())
                .thenReturn(List.of());

        List<JobResponse> result =
                jobService.getAllJobs();

        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(jobRepository)
                .findAll();
    }


    // =========================================================
    // GET JOB BY ID
    // =========================================================

    @Test
    void getJobById_ShouldReturnJob_WhenJobExists() {

        User hr = User.builder()
                .id(1L)
                .firstName("HR")
                .lastName("User")
                .email("hr@gmail.com")
                .build();

        Job job = Job.builder()
                .id(10L)
                .title("Java Developer")
                .description("Spring Boot Developer")
                .companyName("HireAI")
                .location("Bhubaneswar")
                .salary(600000.0)
                .jobType(JobType.FULL_TIME)
                .status(JobStatus.OPEN)
                .hr(hr)
                .build();

        when(jobRepository.findById(10L))
                .thenReturn(Optional.of(job));

        JobResponse response =
                jobService.getJobById(10L);

        assertNotNull(response);

        assertEquals(
                10L,
                response.getId()
        );

        assertEquals(
                "Java Developer",
                response.getTitle()
        );

        assertEquals(
                "HireAI",
                response.getCompanyName()
        );

        assertEquals(
                JobStatus.OPEN,
                response.getStatus()
        );

        verify(jobRepository)
                .findById(10L);
    }


    // =========================================================
    // GET JOB BY ID - NOT FOUND
    // =========================================================

    @Test
    void getJobById_ShouldThrowException_WhenJobDoesNotExist() {

        when(jobRepository.findById(999L))
                .thenReturn(Optional.empty());

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> jobService.getJobById(999L)
                );

        assertEquals(
                "Job not found",
                exception.getMessage()
        );

        verify(jobRepository)
                .findById(999L);
    }


    // =========================================================
    // GET MY JOBS
    // =========================================================

    @Test
    void getMyJobs_ShouldReturnJobsBelongingToHR() {

        User hr = User.builder()
                .id(5L)
                .firstName("HR")
                .lastName("User")
                .email("hr@gmail.com")
                .build();

        Job job = Job.builder()
                .id(20L)
                .title("Java Developer")
                .description("Java job")
                .companyName("HireAI")
                .location("Bhubaneswar")
                .salary(600000.0)
                .jobType(JobType.FULL_TIME)
                .status(JobStatus.OPEN)
                .hr(hr)
                .build();

        when(userRepository.findByEmail("hr@gmail.com"))
                .thenReturn(Optional.of(hr));

        when(jobRepository.findByHrId(5L))
                .thenReturn(List.of(job));

        List<JobResponse> result =
                jobService.getMyJobs("hr@gmail.com");

        assertNotNull(result);
        assertEquals(1, result.size());

        assertEquals(
                20L,
                result.get(0).getId()
        );

        assertEquals(
                "Java Developer",
                result.get(0).getTitle()
        );

        verify(userRepository)
                .findByEmail("hr@gmail.com");

        verify(jobRepository)
                .findByHrId(5L);
    }


    // =========================================================
    // GET MY JOBS - HR NOT FOUND
    // =========================================================

    @Test
    void getMyJobs_ShouldThrowException_WhenHRDoesNotExist() {

        when(userRepository.findByEmail("missing@gmail.com"))
                .thenReturn(Optional.empty());

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> jobService.getMyJobs(
                                "missing@gmail.com"
                        )
                );

        assertEquals(
                "User not found",
                exception.getMessage()
        );

        verify(userRepository)
                .findByEmail("missing@gmail.com");

        verify(jobRepository, never())
                .findByHrId(anyLong());
    }


    // =========================================================
    // UPDATE JOB
    // =========================================================

    @Test
    void updateJob_ShouldUpdateJob_WhenHROwnsJob() {

        User hr = User.builder()
                .id(1L)
                .firstName("HR")
                .lastName("User")
                .email("hr@gmail.com")
                .build();

        Job job = Job.builder()
                .id(1L)
                .title("Old Title")
                .description("Old Description")
                .companyName("Old Company")
                .location("Old Location")
                .salary(500000.0)
                .jobType(JobType.FULL_TIME)
                .status(JobStatus.OPEN)
                .hr(hr)
                .build();

        CreateJobRequest request =
                new CreateJobRequest();

        request.setTitle("Updated Java Developer");
        request.setDescription("Updated Description");
        request.setCompanyName("Updated Company");
        request.setLocation("Remote");
        request.setSalary(800000.0);
        request.setJobType(JobType.FULL_TIME);

        when(jobRepository.findById(1L))
                .thenReturn(Optional.of(job));

        when(jobRepository.save(job))
                .thenReturn(job);

        JobResponse response =
                jobService.updateJob(
                        1L,
                        request,
                        "hr@gmail.com"
                );

        assertNotNull(response);

        assertEquals(
                "Updated Java Developer",
                response.getTitle()
        );

        assertEquals(
                "Updated Description",
                response.getDescription()
        );

        assertEquals(
                "Updated Company",
                response.getCompanyName()
        );

        assertEquals(
                "Remote",
                response.getLocation()
        );

        assertEquals(
                800000.0,
                response.getSalary()
        );

        assertEquals(
                JobType.FULL_TIME,
                response.getJobType()
        );

        verify(jobRepository)
                .findById(1L);

        verify(jobRepository)
                .save(job);
    }


    // =========================================================
    // UPDATE JOB - JOB NOT FOUND
    // =========================================================

    @Test
    void updateJob_ShouldThrowException_WhenJobDoesNotExist() {

        CreateJobRequest request =
                new CreateJobRequest();

        when(jobRepository.findById(999L))
                .thenReturn(Optional.empty());

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> jobService.updateJob(
                                999L,
                                request,
                                "hr@gmail.com"
                        )
                );

        assertEquals(
                "Job not found",
                exception.getMessage()
        );

        verify(jobRepository)
                .findById(999L);

        verify(jobRepository, never())
                .save(any(Job.class));
    }


    // =========================================================
    // UPDATE JOB - WRONG HR
    // =========================================================

    @Test
    void updateJob_ShouldThrowException_WhenHRDoesNotOwnJob() {

        User owner = User.builder()
                .id(1L)
                .email("owner@gmail.com")
                .build();

        Job job = Job.builder()
                .id(1L)
                .title("Java Developer")
                .hr(owner)
                .build();

        CreateJobRequest request =
                new CreateJobRequest();

        when(jobRepository.findById(1L))
                .thenReturn(Optional.of(job));

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> jobService.updateJob(
                                1L,
                                request,
                                "other@gmail.com"
                        )
                );

        assertEquals(
                "You cannot update this job",
                exception.getMessage()
        );

        verify(jobRepository)
                .findById(1L);

        verify(jobRepository, never())
                .save(any(Job.class));
    }


    // =========================================================
    // DELETE JOB
    // =========================================================

    @Test
    void deleteJob_ShouldDeleteApplicationsAndJob_WhenHROwnsJob() {

        User hr = User.builder()
                .id(1L)
                .email("hr@gmail.com")
                .build();

        Job job = Job.builder()
                .id(1L)
                .title("Java Developer")
                .hr(hr)
                .build();

        when(jobRepository.findById(1L))
                .thenReturn(Optional.of(job));

        jobService.deleteJob(
                1L,
                "hr@gmail.com"
        );

        verify(applicationRepository)
                .deleteByJobId(1L);

        verify(jobRepository)
                .delete(job);
    }


    // =========================================================
    // DELETE JOB - JOB NOT FOUND
    // =========================================================

    @Test
    void deleteJob_ShouldThrowException_WhenJobDoesNotExist() {

        when(jobRepository.findById(999L))
                .thenReturn(Optional.empty());

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> jobService.deleteJob(
                                999L,
                                "hr@gmail.com"
                        )
                );

        assertEquals(
                "Job not found",
                exception.getMessage()
        );

        verify(jobRepository)
                .findById(999L);

        verify(applicationRepository, never())
                .deleteByJobId(anyLong());

        verify(jobRepository, never())
                .delete(any(Job.class));
    }


    // =========================================================
    // DELETE JOB - WRONG HR
    // =========================================================

    @Test
    void deleteJob_ShouldThrowException_WhenHRDoesNotOwnJob() {

        User owner = User.builder()
                .id(1L)
                .email("owner@gmail.com")
                .build();

        Job job = Job.builder()
                .id(1L)
                .title("Java Developer")
                .hr(owner)
                .build();

        when(jobRepository.findById(1L))
                .thenReturn(Optional.of(job));

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> jobService.deleteJob(
                                1L,
                                "other@gmail.com"
                        )
                );

        assertEquals(
                "You cannot delete this job",
                exception.getMessage()
        );

        verify(jobRepository)
                .findById(1L);

        verify(applicationRepository, never())
                .deleteByJobId(anyLong());

        verify(jobRepository, never())
                .delete(any(Job.class));
    }
}