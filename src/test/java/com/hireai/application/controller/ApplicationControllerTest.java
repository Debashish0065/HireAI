package com.hireai.application.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hireai.application.dto.request.ApplyJobRequest;
import com.hireai.application.dto.request.UpdateApplicationStatusRequest;
import com.hireai.application.dto.response.ApplicationResponse;
import com.hireai.application.service.ApplicationService;

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
class ApplicationControllerTest {

    @Mock
    private ApplicationService applicationService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private ApplicationController applicationController;

    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    private final String candidateEmail =
            "candidate@hireai.com";

    private final String hrEmail =
            "hr@hireai.com";


    @BeforeEach
    void setUp() {

        mockMvc =
                MockMvcBuilders
                        .standaloneSetup(applicationController)
                        .build();

        objectMapper =
                new ObjectMapper();

        objectMapper.findAndRegisterModules();
    }


    // =========================================================
    // APPLY JOB - SUCCESS
    // =========================================================

    @Test
    void applyJob_ShouldReturn200_WhenSuccessful()
            throws Exception {

        when(authentication.getName())
                .thenReturn(candidateEmail);

        ApplyJobRequest request =
                createApplyJobRequest(10L);

        ApplicationResponse response =
                createApplicationResponse(1L);

        when(applicationService.applyJob(
                any(ApplyJobRequest.class),
                eq(candidateEmail)
        )).thenReturn(response);

        mockMvc.perform(
                post("/api/v1/applications")
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
        .andExpect(jsonPath("$.jobId")
                .value(10))
        .andExpect(jsonPath("$.jobTitle")
                .value("Java Developer"))
        .andExpect(jsonPath("$.companyName")
                .value("HireAI"))
        .andExpect(jsonPath("$.candidateEmail")
                .value(candidateEmail))
        .andExpect(jsonPath("$.status")
                .value("APPLIED"));
    }


    // =========================================================
    // APPLY JOB - SERVICE CALLED
    // =========================================================

    @Test
    void applyJob_ShouldCallApplicationService()
            throws Exception {

        when(authentication.getName())
                .thenReturn(candidateEmail);

        ApplyJobRequest request =
                createApplyJobRequest(15L);

        ApplicationResponse response =
                createApplicationResponse(5L);

        when(applicationService.applyJob(
                any(ApplyJobRequest.class),
                eq(candidateEmail)
        )).thenReturn(response);

        mockMvc.perform(
                post("/api/v1/applications")
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

        verify(applicationService)
                .applyJob(
                        any(ApplyJobRequest.class),
                        eq(candidateEmail)
                );
    }


    // =========================================================
    // GET MY APPLICATIONS - SUCCESS
    // =========================================================

    @Test
    void getMyApplications_ShouldReturn200()
            throws Exception {

        when(authentication.getName())
                .thenReturn(candidateEmail);

        List<ApplicationResponse> applications =
                List.of(
                        createApplicationResponse(1L),
                        createApplicationResponse(2L)
                );

        when(applicationService.getMyApplications(
                candidateEmail
        )).thenReturn(applications);

        mockMvc.perform(
                get("/api/v1/applications/my")
                        .principal(authentication)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()")
                .value(2));
    }


    // =========================================================
    // GET MY APPLICATIONS - EMPTY
    // =========================================================

    @Test
    void getMyApplications_ShouldReturnEmptyList()
            throws Exception {

        when(authentication.getName())
                .thenReturn(candidateEmail);

        when(applicationService.getMyApplications(
                candidateEmail
        )).thenReturn(List.of());

        mockMvc.perform(
                get("/api/v1/applications/my")
                        .principal(authentication)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()")
                .value(0));

        verify(applicationService)
                .getMyApplications(candidateEmail);
    }


    // =========================================================
    // GET APPLICATION BY ID - SUCCESS
    // =========================================================

    @Test
    void getMyApplicationById_ShouldReturn200()
            throws Exception {

        when(authentication.getName())
                .thenReturn(candidateEmail);

        ApplicationResponse response =
                createApplicationResponse(20L);

        when(applicationService.getMyApplicationById(
                20L,
                candidateEmail
        )).thenReturn(response);

        mockMvc.perform(
                get("/api/v1/applications/20")
                        .principal(authentication)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id")
                .value(20));
    }


    // =========================================================
    // GET APPLICATION BY ID - SERVICE CALLED
    // =========================================================

    @Test
    void getMyApplicationById_ShouldCallService()
            throws Exception {

        when(authentication.getName())
                .thenReturn(candidateEmail);

        ApplicationResponse response =
                createApplicationResponse(25L);

        when(applicationService.getMyApplicationById(
                25L,
                candidateEmail
        )).thenReturn(response);

        mockMvc.perform(
                get("/api/v1/applications/25")
                        .principal(authentication)
        )
        .andExpect(status().isOk());

        verify(applicationService)
                .getMyApplicationById(
                        25L,
                        candidateEmail
                );
    }


    // =========================================================
    // WITHDRAW APPLICATION - SUCCESS
    // =========================================================

    @Test
    void withdrawApplication_ShouldReturn200()
            throws Exception {

        when(authentication.getName())
                .thenReturn(candidateEmail);

        doNothing().when(applicationService)
                .withdrawApplication(
                        30L,
                        candidateEmail
                );

        mockMvc.perform(
                delete("/api/v1/applications/30")
                        .principal(authentication)
        )
        .andExpect(status().isOk())
        .andExpect(content().string(
                "Application withdrawn successfully"
        ));

        verify(applicationService)
                .withdrawApplication(
                        30L,
                        candidateEmail
                );
    }


    // =========================================================
    // HR - GET ALL APPLICANTS
    // =========================================================

    @Test
    void getApplicantsForHR_ShouldReturn200()
            throws Exception {

        when(authentication.getName())
                .thenReturn(hrEmail);

        List<ApplicationResponse> applications =
                List.of(
                        createApplicationResponse(1L),
                        createApplicationResponse(2L),
                        createApplicationResponse(3L)
                );

        when(applicationService.getApplicantsForHR(
                hrEmail
        )).thenReturn(applications);

        mockMvc.perform(
                get("/api/v1/applications/hr")
                        .principal(authentication)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()")
                .value(3));
    }


    // =========================================================
    // HR - GET ALL APPLICANTS - SERVICE CALLED
    // =========================================================

    @Test
    void getApplicantsForHR_ShouldCallService()
            throws Exception {

        when(authentication.getName())
                .thenReturn(hrEmail);

        when(applicationService.getApplicantsForHR(
                hrEmail
        )).thenReturn(List.of());

        mockMvc.perform(
                get("/api/v1/applications/hr")
                        .principal(authentication)
        )
        .andExpect(status().isOk());

        verify(applicationService)
                .getApplicantsForHR(hrEmail);
    }


    // =========================================================
    // HR - GET APPLICANTS FOR JOB
    // =========================================================

    @Test
    void getApplicantsForHRJob_ShouldReturn200()
            throws Exception {

        when(authentication.getName())
                .thenReturn(hrEmail);

        List<ApplicationResponse> applications =
                List.of(
                        createApplicationResponse(10L),
                        createApplicationResponse(11L)
                );

        when(applicationService.getApplicantsForHRJob(
                100L,
                hrEmail
        )).thenReturn(applications);

        mockMvc.perform(
                get("/api/v1/applications/hr/job/100")
                        .principal(authentication)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()")
                .value(2));
    }


    // =========================================================
    // HR - GET APPLICANTS FOR JOB - SERVICE CALLED
    // =========================================================

    @Test
    void getApplicantsForHRJob_ShouldCallService()
            throws Exception {

        when(authentication.getName())
                .thenReturn(hrEmail);

        when(applicationService.getApplicantsForHRJob(
                200L,
                hrEmail
        )).thenReturn(List.of());

        mockMvc.perform(
                get("/api/v1/applications/hr/job/200")
                        .principal(authentication)
        )
        .andExpect(status().isOk());

        verify(applicationService)
                .getApplicantsForHRJob(
                        200L,
                        hrEmail
                );
    }


    // =========================================================
    // UPDATE STATUS - SUCCESS
    // =========================================================

    @Test
    void updateStatus_ShouldReturn200()
            throws Exception {

        when(authentication.getName())
                .thenReturn(hrEmail);

        UpdateApplicationStatusRequest request =
                new UpdateApplicationStatusRequest();

        request.setStatus("SHORTLISTED");

        ApplicationResponse response =
                createApplicationResponse(40L);

        response.setStatus("SHORTLISTED");

        when(applicationService.updateStatus(
                eq(40L),
                any(UpdateApplicationStatusRequest.class),
                eq(hrEmail)
        )).thenReturn(response);

        mockMvc.perform(
                put("/api/v1/applications/40/status")
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
                .value(40))
        .andExpect(jsonPath("$.status")
                .value("SHORTLISTED"));
    }


    // =========================================================
    // UPDATE STATUS - SERVICE CALLED
    // =========================================================

    @Test
    void updateStatus_ShouldCallService()
            throws Exception {

        when(authentication.getName())
                .thenReturn(hrEmail);

        UpdateApplicationStatusRequest request =
                new UpdateApplicationStatusRequest();

        request.setStatus("REJECTED");

        ApplicationResponse response =
                createApplicationResponse(50L);

        response.setStatus("REJECTED");

        when(applicationService.updateStatus(
                eq(50L),
                any(UpdateApplicationStatusRequest.class),
                eq(hrEmail)
        )).thenReturn(response);

        mockMvc.perform(
                put("/api/v1/applications/50/status")
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

        verify(applicationService)
                .updateStatus(
                        eq(50L),
                        any(UpdateApplicationStatusRequest.class),
                        eq(hrEmail)
                );
    }


    // =========================================================
    // CHECK IF APPLIED - TRUE
    // =========================================================

    @Test
    void hasApplied_ShouldReturnTrue()
            throws Exception {

        when(authentication.getName())
                .thenReturn(candidateEmail);

        when(applicationService.hasApplied(
                100L,
                candidateEmail
        )).thenReturn(true);

        mockMvc.perform(
                get("/api/v1/applications/check/100")
                        .principal(authentication)
        )
        .andExpect(status().isOk())
        .andExpect(content().string("true"));
    }


    // =========================================================
    // CHECK IF APPLIED - FALSE
    // =========================================================

    @Test
    void hasApplied_ShouldReturnFalse()
            throws Exception {

        when(authentication.getName())
                .thenReturn(candidateEmail);

        when(applicationService.hasApplied(
                200L,
                candidateEmail
        )).thenReturn(false);

        mockMvc.perform(
                get("/api/v1/applications/check/200")
                        .principal(authentication)
        )
        .andExpect(status().isOk())
        .andExpect(content().string("false"));

        verify(applicationService)
                .hasApplied(
                        200L,
                        candidateEmail
                );
    }


    // =========================================================
    // COMPLETE APPLICATION RESPONSE DATA
    // =========================================================

    @Test
    void getMyApplicationById_ShouldReturnCompleteData()
            throws Exception {

        when(authentication.getName())
                .thenReturn(candidateEmail);

        ApplicationResponse response =
                ApplicationResponse.builder()
                        .id(75L)
                        .jobId(500L)
                        .jobTitle("Senior Java Developer")
                        .companyName("HireAI Technologies")
                        .candidateName("Debashis Satapathy")
                        .candidateEmail(candidateEmail)
                        .status("APPLIED")
                        .appliedAt(
                                LocalDateTime.of(
                                        2026,
                                        8,
                                        10,
                                        10,
                                        30
                                )
                        )
                        .build();

        when(applicationService.getMyApplicationById(
                75L,
                candidateEmail
        )).thenReturn(response);

        mockMvc.perform(
                get("/api/v1/applications/75")
                        .principal(authentication)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id")
                .value(75))
        .andExpect(jsonPath("$.jobId")
                .value(500))
        .andExpect(jsonPath("$.jobTitle")
                .value("Senior Java Developer"))
        .andExpect(jsonPath("$.companyName")
                .value("HireAI Technologies"))
        .andExpect(jsonPath("$.candidateName")
                .value("Debashis Satapathy"))
        .andExpect(jsonPath("$.candidateEmail")
                .value(candidateEmail))
        .andExpect(jsonPath("$.status")
                .value("APPLIED"));
    }


    // =========================================================
    // HELPERS
    // =========================================================

    private ApplyJobRequest createApplyJobRequest(
            Long jobId
    ) {

        ApplyJobRequest request =
                new ApplyJobRequest();

        request.setJobId(jobId);

        return request;
    }


    private ApplicationResponse createApplicationResponse(
            Long id
    ) {

        return ApplicationResponse.builder()

                .id(id)

                .jobId(10L)

                .jobTitle(
                        "Java Developer"
                )

                .companyName(
                        "HireAI"
                )

                .candidateName(
                        "Test Candidate"
                )

                .candidateEmail(
                        candidateEmail
                )

                .status(
                        "APPLIED"
                )

                .appliedAt(
                        LocalDateTime.of(
                                2026,
                                8,
                                15,
                                10,
                                30
                        )
                )

                .build();
    }
}