package com.hireai.job.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hireai.job.dto.request.CreateJobRequest;
import com.hireai.job.dto.response.JobResponse;
import com.hireai.job.dto.response.JobResponse.HrInfo;
import com.hireai.job.enums.JobStatus;
import com.hireai.job.enums.JobType;
import com.hireai.job.service.JobService;

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
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class JobControllerTest {

    @Mock
    private JobService jobService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private JobController jobController;

    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    private final String hrEmail =
            "hr@hireai.com";

    @BeforeEach
    void setUp() {

        mockMvc =
                MockMvcBuilders
                        .standaloneSetup(jobController)
                        .build();

        objectMapper =
                new ObjectMapper();

        objectMapper.findAndRegisterModules();
    }


    // =========================================================
    // CREATE JOB - SUCCESS
    // =========================================================

    @Test
    void createJob_ShouldReturn200_WhenSuccessful()
            throws Exception {

        when(authentication.getName())
                .thenReturn(hrEmail);

        CreateJobRequest request =
                createRequest();

        JobResponse response =
                createJobResponse(1L);

        when(jobService.createJob(
                any(CreateJobRequest.class),
                eq(hrEmail)
        )).thenReturn(response);

        mockMvc.perform(
                post("/api/v1/jobs")
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
        .andExpect(jsonPath("$.title")
                .value("Java Developer"))
        .andExpect(jsonPath("$.companyName")
                .value("HireAI"))
        .andExpect(jsonPath("$.location")
                .value("Bangalore"));
    }


    // =========================================================
    // CREATE JOB - SERVICE CALLED
    // =========================================================

    @Test
    void createJob_ShouldCallJobService()
            throws Exception {

        when(authentication.getName())
                .thenReturn(hrEmail);

        CreateJobRequest request =
                createRequest();

        JobResponse response =
                createJobResponse(1L);

        when(jobService.createJob(
                any(CreateJobRequest.class),
                eq(hrEmail)
        )).thenReturn(response);

        mockMvc.perform(
                post("/api/v1/jobs")
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

        verify(jobService).createJob(
                any(CreateJobRequest.class),
                eq(hrEmail)
        );
    }


    // =========================================================
    // GET ALL JOBS - SUCCESS
    // =========================================================

    @Test
    void getAllJobs_ShouldReturn200()
            throws Exception {

        List<JobResponse> jobs =
                List.of(
                        createJobResponse(1L),
                        createJobResponse(2L)
                );

        when(jobService.getAllJobs())
                .thenReturn(jobs);

        mockMvc.perform(
                get("/api/v1/jobs")
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()")
                .value(2));
    }


    // =========================================================
    // GET ALL JOBS - EMPTY
    // =========================================================

    @Test
    void getAllJobs_ShouldReturnEmptyList_WhenNoJobs()
            throws Exception {

        when(jobService.getAllJobs())
                .thenReturn(List.of());

        mockMvc.perform(
                get("/api/v1/jobs")
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()")
                .value(0));

        verify(jobService)
                .getAllJobs();
    }


    // =========================================================
    // GET JOB BY ID - SUCCESS
    // =========================================================

    @Test
    void getJobById_ShouldReturn200_WhenJobExists()
            throws Exception {

        JobResponse response =
                createJobResponse(10L);

        when(jobService.getJobById(10L))
                .thenReturn(response);

        mockMvc.perform(
                get("/api/v1/jobs/10")
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id")
                .value(10))
        .andExpect(jsonPath("$.title")
                .value("Java Developer"));
    }


    // =========================================================
    // GET JOB BY ID - SERVICE CALLED
    // =========================================================

    @Test
    void getJobById_ShouldCallJobService()
            throws Exception {

        JobResponse response =
                createJobResponse(15L);

        when(jobService.getJobById(15L))
                .thenReturn(response);

        mockMvc.perform(
                get("/api/v1/jobs/15")
        )
        .andExpect(status().isOk());

        verify(jobService)
                .getJobById(15L);
    }


    // =========================================================
    // GET MY JOBS - SUCCESS
    // =========================================================

    @Test
    void getMyJobs_ShouldReturn200()
            throws Exception {

        when(authentication.getName())
                .thenReturn(hrEmail);

        List<JobResponse> jobs =
                List.of(
                        createJobResponse(1L),
                        createJobResponse(2L)
                );

        when(jobService.getMyJobs(hrEmail))
                .thenReturn(jobs);

        mockMvc.perform(
                get("/api/v1/jobs/my-jobs")
                        .principal(authentication)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()")
                .value(2));
    }


    // =========================================================
    // GET MY JOBS - SERVICE CALLED
    // =========================================================

    @Test
    void getMyJobs_ShouldUseAuthenticatedEmail()
            throws Exception {

        when(authentication.getName())
                .thenReturn(hrEmail);

        when(jobService.getMyJobs(hrEmail))
                .thenReturn(List.of());

        mockMvc.perform(
                get("/api/v1/jobs/my-jobs")
                        .principal(authentication)
        )
        .andExpect(status().isOk());

        verify(jobService)
                .getMyJobs(hrEmail);
    }


    // =========================================================
    // UPDATE JOB - SUCCESS
    // =========================================================

    @Test
    void updateJob_ShouldReturn200_WhenSuccessful()
            throws Exception {

        when(authentication.getName())
                .thenReturn(hrEmail);

        CreateJobRequest request =
                createRequest();

        JobResponse response =
                createJobResponse(20L);

        when(jobService.updateJob(
                eq(20L),
                any(CreateJobRequest.class),
                eq(hrEmail)
        )).thenReturn(response);

        mockMvc.perform(
                put("/api/v1/jobs/20")
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
                .value(20))
        .andExpect(jsonPath("$.title")
                .value("Java Developer"));
    }


    // =========================================================
    // UPDATE JOB - SERVICE CALLED
    // =========================================================

    @Test
    void updateJob_ShouldCallJobService()
            throws Exception {

        when(authentication.getName())
                .thenReturn(hrEmail);

        CreateJobRequest request =
                createRequest();

        JobResponse response =
                createJobResponse(25L);

        when(jobService.updateJob(
                eq(25L),
                any(CreateJobRequest.class),
                eq(hrEmail)
        )).thenReturn(response);

        mockMvc.perform(
                put("/api/v1/jobs/25")
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

        verify(jobService).updateJob(
                eq(25L),
                any(CreateJobRequest.class),
                eq(hrEmail)
        );
    }


    // =========================================================
    // DELETE JOB - SUCCESS
    // =========================================================

    @Test
    void deleteJob_ShouldReturn200_WhenSuccessful()
            throws Exception {

        doNothing().when(jobService)
                .deleteJob(
                        eq(1L),
                        eq("hr@example.com")
                );

        mockMvc.perform(
                delete("/api/v1/jobs/1")
                        .principal(
                                new Authentication() {

                                    @Override
                                    public String getName() {
                                        return "hr@example.com";
                                    }

                                    @Override
                                    public java.util.Collection<
                                            ? extends org.springframework.security.core.GrantedAuthority>
                                    getAuthorities() {
                                        return List.of();
                                    }

                                    @Override
                                    public Object getCredentials() {
                                        return null;
                                    }

                                    @Override
                                    public Object getDetails() {
                                        return null;
                                    }

                                    @Override
                                    public Object getPrincipal() {
                                        return "hr@example.com";
                                    }

                                    @Override
                                    public boolean isAuthenticated() {
                                        return true;
                                    }

                                    @Override
                                    public void setAuthenticated(
                                            boolean isAuthenticated) {
                                    }
                                }
                        )
        )
        .andExpect(status().isOk())
        .andExpect(content().string(
                "Job deleted successfully"
        ));

        verify(jobService).deleteJob(
                1L,
                "hr@example.com"
        );
    }


    // =========================================================
    // DELETE JOB - SERVICE CALLED
    // =========================================================

    @Test
    void deleteJob_ShouldCallJobService()
            throws Exception {

        when(authentication.getName())
                .thenReturn(hrEmail);

        mockMvc.perform(
                delete("/api/v1/jobs/35")
                        .principal(authentication)
        )
        .andExpect(status().isOk());

        verify(jobService)
                .deleteJob(
                        35L,
                        hrEmail
                );
    }


    // =========================================================
    // JOB RESPONSE DATA
    // =========================================================

    @Test
    void getJobById_ShouldReturnCompleteJobData()
            throws Exception {

        JobResponse response =
                JobResponse.builder()
                        .id(50L)
                        .title("Spring Boot Developer")
                        .description(
                                "Develop REST APIs using Spring Boot"
                        )
                        .companyName("Tech Company")
                        .location("Bhubaneswar")
                        .salary(70000.0)
                        .jobType(JobType.FULL_TIME)
                        .status(JobStatus.OPEN)
                        .hr(
                                HrInfo.builder()
                                        .id(100L)
                                        .firstName("HR")
                                        .lastName("Manager")
                                        .email(hrEmail)
                                        .build()
                        )
                        .createdAt(
                                LocalDateTime.of(
                                        2026,
                                        8,
                                        1,
                                        10,
                                        30
                                )
                        )
                        .build();

        when(jobService.getJobById(50L))
                .thenReturn(response);

        mockMvc.perform(
                get("/api/v1/jobs/50")
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id")
                .value(50))
        .andExpect(jsonPath("$.title")
                .value("Spring Boot Developer"))
        .andExpect(jsonPath("$.description")
                .value(
                        "Develop REST APIs using Spring Boot"
                ))
        .andExpect(jsonPath("$.companyName")
                .value("Tech Company"))
        .andExpect(jsonPath("$.location")
                .value("Bhubaneswar"))
        .andExpect(jsonPath("$.salary")
                .value(70000.0))
        .andExpect(jsonPath("$.jobType")
                .value(JobType.FULL_TIME.name()))
        .andExpect(jsonPath("$.status")
                .value(JobStatus.OPEN.name()))
        .andExpect(jsonPath("$.hr.id")
                .value(100))
        .andExpect(jsonPath("$.hr.firstName")
                .value("HR"))
        .andExpect(jsonPath("$.hr.lastName")
                .value("Manager"))
        .andExpect(jsonPath("$.hr.email")
                .value(hrEmail));
    }


    // =========================================================
    // HELPERS
    // =========================================================

    private CreateJobRequest createRequest() {

        CreateJobRequest request =
                new CreateJobRequest();

        request.setTitle(
                "Java Developer"
        );

        request.setDescription(
                "Develop Spring Boot applications"
        );

        request.setCompanyName(
                "HireAI"
        );

        request.setLocation(
                "Bangalore"
        );

        request.setSalary(
                60000.0
        );

        request.setJobType(
                JobType.FULL_TIME
        );

        return request;
    }


    private JobResponse createJobResponse(
            Long id
    ) {

        return JobResponse.builder()

                .id(id)

                .title(
                        "Java Developer"
                )

                .description(
                        "Develop Spring Boot applications"
                )

                .companyName(
                        "HireAI"
                )

                .location(
                        "Bangalore"
                )

                .salary(
                        60000.0
                )

                .jobType(
                        JobType.FULL_TIME
                )

                .status(
                        JobStatus.OPEN
                )

                .hr(
                        HrInfo.builder()
                                .id(100L)
                                .firstName("HR")
                                .lastName("Manager")
                                .email(hrEmail)
                                .build()
                )

                .createdAt(
                        LocalDateTime.now()
                )

                .build();
    }
}