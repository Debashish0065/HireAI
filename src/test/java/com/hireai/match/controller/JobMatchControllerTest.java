package com.hireai.match.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hireai.match.dto.request.JobMatchRequest;
import com.hireai.match.dto.response.JobMatchResponse;
import com.hireai.match.service.JobMatchService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;

import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class JobMatchControllerTest {

    // =========================================================
    // MOCKS
    // =========================================================

    @Mock
    private JobMatchService jobMatchService;

    @Mock
    private Authentication authentication;

    // =========================================================
    // CONTROLLER
    // =========================================================

    @InjectMocks
    private JobMatchController jobMatchController;

    // =========================================================
    // MOCK MVC
    // =========================================================

    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    // =========================================================
    // TEST DATA
    // =========================================================

    private JobMatchRequest request;

    private JobMatchResponse response;

    private JobMatchResponse secondResponse;

    private final String candidateEmail =
            "candidate@gmail.com";

    // =========================================================
    // SETUP
    // =========================================================

    @BeforeEach
    void setUp() {

        mockMvc =
                MockMvcBuilders
                        .standaloneSetup(jobMatchController)
                        .build();

        objectMapper =
                new ObjectMapper();

        objectMapper.findAndRegisterModules();

        // -----------------------------------------------------
        // REQUEST
        // -----------------------------------------------------

        request =
                new JobMatchRequest();

        request.setResumeId(10L);
        request.setJobId(20L);

        // -----------------------------------------------------
        // RESPONSE
        // -----------------------------------------------------

        response =
                JobMatchResponse.builder()
                        .id(100L)
                        .resumeId(10L)
                        .jobId(20L)
                        .jobTitle(
                                "Java Backend Developer"
                        )
                        .companyName(
                                "HireAI Technologies"
                        )
                        .matchScore(85)
                        .matchingSkills(
                                "Java, Spring Boot, MySQL, REST API"
                        )
                        .missingSkills(
                                "Docker, AWS"
                        )
                        .strengths(
                                "Strong Java and backend development skills"
                        )
                        .recommendation(
                                "Highly Recommended"
                        )
                        .createdAt(
                                LocalDateTime.of(
                                        2026,
                                        8,
                                        18,
                                        10,
                                        30
                                )
                        )
                        .build();

        // -----------------------------------------------------
        // SECOND RESPONSE
        // -----------------------------------------------------

        secondResponse =
                JobMatchResponse.builder()
                        .id(101L)
                        .resumeId(10L)
                        .jobId(21L)
                        .jobTitle(
                                "Spring Boot Developer"
                        )
                        .companyName(
                                "ABC Technologies"
                        )
                        .matchScore(78)
                        .matchingSkills(
                                "Java, Spring Boot"
                        )
                        .missingSkills(
                                "AWS, Kubernetes"
                        )
                        .strengths(
                                "Good backend knowledge"
                        )
                        .recommendation(
                                "Recommended"
                        )
                        .createdAt(
                                LocalDateTime.of(
                                        2026,
                                        8,
                                        18,
                                        11,
                                        30
                                )
                        )
                        .build();

        // -----------------------------------------------------
        // AUTHENTICATION
        // -----------------------------------------------------

        when(authentication.getName())
                .thenReturn(candidateEmail);
    }

    // =========================================================
    // POST /api/v1/job-matches
    // =========================================================

    @Test
    void matchResumeWithJob_ShouldReturnJobMatchResponse()
            throws Exception {

        when(
                jobMatchService.matchResumeWithJob(
                        any(JobMatchRequest.class),
                        eq(candidateEmail)
                )
        ).thenReturn(response);

        mockMvc.perform(
                post("/api/v1/job-matches")
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
        .andExpect(
                status().isOk()
        )
        .andExpect(
                content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON
                )
        )
        .andExpect(
                jsonPath("$.id")
                        .value(100)
        )
        .andExpect(
                jsonPath("$.resumeId")
                        .value(10)
        )
        .andExpect(
                jsonPath("$.jobId")
                        .value(20)
        )
        .andExpect(
                jsonPath("$.jobTitle")
                        .value(
                                "Java Backend Developer"
                        )
        )
        .andExpect(
                jsonPath("$.companyName")
                        .value(
                                "HireAI Technologies"
                        )
        )
        .andExpect(
                jsonPath("$.matchScore")
                        .value(85)
        )
        .andExpect(
                jsonPath("$.matchingSkills")
                        .value(
                                "Java, Spring Boot, MySQL, REST API"
                        )
        )
        .andExpect(
                jsonPath("$.missingSkills")
                        .value(
                                "Docker, AWS"
                        )
        )
        .andExpect(
                jsonPath("$.strengths")
                        .value(
                                "Strong Java and backend development skills"
                        )
        )
        .andExpect(
                jsonPath("$.recommendation")
                        .value(
                                "Highly Recommended"
                        )
        );

        verify(
                jobMatchService
        ).matchResumeWithJob(
                any(JobMatchRequest.class),
                eq(candidateEmail)
        );
    }

    // =========================================================
    // GET /api/v1/job-matches/my
    // =========================================================

    @Test
    void getMyMatches_ShouldReturnCandidateMatches()
            throws Exception {

        when(
                jobMatchService.getMyMatches(
                        candidateEmail
                )
        ).thenReturn(
                List.of(
                        response,
                        secondResponse
                )
        );

        mockMvc.perform(
                get("/api/v1/job-matches/my")
                        .principal(authentication)
        )
        .andExpect(
                status().isOk()
        )
        .andExpect(
                content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON
                )
        )
        .andExpect(
                jsonPath("$.length()")
                        .value(2)
        )
        .andExpect(
                jsonPath("$[0].id")
                        .value(100)
        )
        .andExpect(
                jsonPath("$[0].resumeId")
                        .value(10)
        )
        .andExpect(
                jsonPath("$[0].jobId")
                        .value(20)
        )
        .andExpect(
                jsonPath("$[0].jobTitle")
                        .value(
                                "Java Backend Developer"
                        )
        )
        .andExpect(
                jsonPath("$[0].matchScore")
                        .value(85)
        )
        .andExpect(
                jsonPath("$[1].id")
                        .value(101)
        )
        .andExpect(
                jsonPath("$[1].resumeId")
                        .value(10)
        )
        .andExpect(
                jsonPath("$[1].jobId")
                        .value(21)
        )
        .andExpect(
                jsonPath("$[1].jobTitle")
                        .value(
                                "Spring Boot Developer"
                        )
        )
        .andExpect(
                jsonPath("$[1].matchScore")
                        .value(78)
        );

        verify(
                jobMatchService
        ).getMyMatches(
                candidateEmail
        );
    }

    // =========================================================
    // GET /api/v1/job-matches/{id}
    // =========================================================

    @Test
    void getMatchById_ShouldReturnMatch()
            throws Exception {

        when(
                jobMatchService.getMatchById(
                        100L,
                        candidateEmail
                )
        ).thenReturn(response);

        mockMvc.perform(
                get("/api/v1/job-matches/100")
                        .principal(authentication)
        )
        .andExpect(
                status().isOk()
        )
        .andExpect(
                content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON
                )
        )
        .andExpect(
                jsonPath("$.id")
                        .value(100)
        )
        .andExpect(
                jsonPath("$.resumeId")
                        .value(10)
        )
        .andExpect(
                jsonPath("$.jobId")
                        .value(20)
        )
        .andExpect(
                jsonPath("$.jobTitle")
                        .value(
                                "Java Backend Developer"
                        )
        )
        .andExpect(
                jsonPath("$.companyName")
                        .value(
                                "HireAI Technologies"
                        )
        )
        .andExpect(
                jsonPath("$.matchScore")
                        .value(85)
        )
        .andExpect(
                jsonPath("$.recommendation")
                        .value(
                                "Highly Recommended"
                        )
        );

        verify(
                jobMatchService
        ).getMatchById(
                100L,
                candidateEmail
        );
    }

    // =========================================================
    // POST - REQUEST DATA VERIFICATION
    // =========================================================

    @Test
    void matchResumeWithJob_ShouldPassCorrectRequestToService()
            throws Exception {

        when(
                jobMatchService.matchResumeWithJob(
                        any(JobMatchRequest.class),
                        eq(candidateEmail)
                )
        ).thenReturn(response);

        mockMvc.perform(
                post("/api/v1/job-matches")
                        .contentType(
                                MediaType.APPLICATION_JSON
                        )
                        .content(
                                """
                                {
                                    "resumeId": 10,
                                    "jobId": 20
                                }
                                """
                        )
                        .principal(authentication)
        )
        .andExpect(
                status().isOk()
        );

        verify(
                jobMatchService
        ).matchResumeWithJob(
                any(JobMatchRequest.class),
                eq(candidateEmail)
        );
    }

    // =========================================================
    // GET MY MATCHES - EMPTY LIST
    // =========================================================

    @Test
    void getMyMatches_ShouldReturnEmptyList_WhenNoMatchesExist()
            throws Exception {

        when(
                jobMatchService.getMyMatches(
                        candidateEmail
                )
        ).thenReturn(
                List.of()
        );

        mockMvc.perform(
                get("/api/v1/job-matches/my")
                        .principal(authentication)
        )
        .andExpect(
                status().isOk()
        )
        .andExpect(
                jsonPath("$.length()")
                        .value(0)
        );

        verify(
                jobMatchService
        ).getMyMatches(
                candidateEmail
        );
    }

    // =========================================================
    // GET MATCH BY ID - DIFFERENT ID
    // =========================================================

    @Test
    void getMatchById_ShouldPassCorrectIdAndEmail()
            throws Exception {

        when(
                jobMatchService.getMatchById(
                        999L,
                        candidateEmail
                )
        ).thenReturn(response);

        mockMvc.perform(
                get("/api/v1/job-matches/999")
                        .principal(authentication)
        )
        .andExpect(
                status().isOk()
        );

        verify(
                jobMatchService
        ).getMatchById(
                999L,
                candidateEmail
        );
    }
}