package com.hireai.interview.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hireai.interview.dto.request.StartInterviewRequest;
import com.hireai.interview.dto.request.SubmitAnswerRequest;
import com.hireai.interview.dto.response.InterviewQuestionResponse;
import com.hireai.interview.dto.response.InterviewResponse;
import com.hireai.interview.dto.response.InterviewStatisticsResponse;
import com.hireai.interview.enums.InterviewStatus;
import com.hireai.interview.enums.QuestionType;
import com.hireai.interview.service.InterviewService;

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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class InterviewControllerTest {

    @Mock
    private InterviewService interviewService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private InterviewController interviewController;

    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    private final String candidateEmail =
            "candidate@hireai.com";


    @BeforeEach
    void setUp() {

        mockMvc =
                MockMvcBuilders
                        .standaloneSetup(interviewController)
                        .build();

        objectMapper =
                new ObjectMapper();

        objectMapper.findAndRegisterModules();
    }


    // =========================================================
    // START INTERVIEW - SUCCESS
    // =========================================================

    @Test
    void startInterview_ShouldReturn200_WhenSuccessful()
            throws Exception {

        when(authentication.getName())
                .thenReturn(candidateEmail);

        StartInterviewRequest request =
                createStartInterviewRequest();

        InterviewResponse response =
                createInterviewResponse(1L);

        when(interviewService.startInterview(
                any(StartInterviewRequest.class),
                eq(candidateEmail)
        )).thenReturn(response);

        mockMvc.perform(
                post("/api/v1/interviews")
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
        .andExpect(jsonPath("$.totalQuestions")
                .value(5));
    }


    // =========================================================
    // START INTERVIEW - SERVICE CALLED
    // =========================================================

    @Test
    void startInterview_ShouldCallService()
            throws Exception {

        when(authentication.getName())
                .thenReturn(candidateEmail);

        StartInterviewRequest request =
                createStartInterviewRequest();

        when(interviewService.startInterview(
                any(StartInterviewRequest.class),
                eq(candidateEmail)
        )).thenReturn(
                createInterviewResponse(2L)
        );

        mockMvc.perform(
                post("/api/v1/interviews")
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

        verify(interviewService)
                .startInterview(
                        any(StartInterviewRequest.class),
                        eq(candidateEmail)
                );
    }


    // =========================================================
    // GET MY INTERVIEWS - SUCCESS
    // =========================================================

    @Test
    void getMyInterviews_ShouldReturn200()
            throws Exception {

        when(authentication.getName())
                .thenReturn(candidateEmail);

        when(interviewService.getMyInterviews(
                candidateEmail
        )).thenReturn(
                List.of(
                        createInterviewResponse(1L),
                        createInterviewResponse(2L)
                )
        );

        mockMvc.perform(
                get("/api/v1/interviews/my")
                        .principal(authentication)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()")
                .value(2));
    }


    // =========================================================
    // GET MY INTERVIEWS - EMPTY
    // =========================================================

    @Test
    void getMyInterviews_ShouldReturnEmptyList()
            throws Exception {

        when(authentication.getName())
                .thenReturn(candidateEmail);

        when(interviewService.getMyInterviews(
                candidateEmail
        )).thenReturn(List.of());

        mockMvc.perform(
                get("/api/v1/interviews/my")
                        .principal(authentication)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()")
                .value(0));

        verify(interviewService)
                .getMyInterviews(candidateEmail);
    }


    // =========================================================
    // GET MY INTERVIEW BY ID
    // =========================================================

    @Test
    void getMyInterviewById_ShouldReturn200()
            throws Exception {

        when(authentication.getName())
                .thenReturn(candidateEmail);

        when(interviewService.getMyInterviewById(
                10L,
                candidateEmail
        )).thenReturn(
                createInterviewResponse(10L)
        );

        mockMvc.perform(
                get("/api/v1/interviews/10")
                        .principal(authentication)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id")
                .value(10));
    }


    // =========================================================
    // GET MY INTERVIEW BY ID - SERVICE CALLED
    // =========================================================

    @Test
    void getMyInterviewById_ShouldCallService()
            throws Exception {

        when(authentication.getName())
                .thenReturn(candidateEmail);

        when(interviewService.getMyInterviewById(
                20L,
                candidateEmail
        )).thenReturn(
                createInterviewResponse(20L)
        );

        mockMvc.perform(
                get("/api/v1/interviews/20")
                        .principal(authentication)
        )
        .andExpect(status().isOk());

        verify(interviewService)
                .getMyInterviewById(
                        20L,
                        candidateEmail
                );
    }


    // =========================================================
    // SUBMIT ANSWER - SUCCESS
    // =========================================================

    @Test
    void submitAnswer_ShouldReturn200()
            throws Exception {

        when(authentication.getName())
                .thenReturn(candidateEmail);

        SubmitAnswerRequest request =
                createSubmitAnswerRequest();

        InterviewResponse response =
                createInterviewResponse(30L);

        when(interviewService.submitAnswer(
                any(SubmitAnswerRequest.class),
                eq(candidateEmail)
        )).thenReturn(response);

        mockMvc.perform(
                put("/api/v1/interviews/answer")
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
                .value(30));
    }


    // =========================================================
    // SUBMIT ANSWER - SERVICE CALLED
    // =========================================================

    @Test
    void submitAnswer_ShouldCallService()
            throws Exception {

        when(authentication.getName())
                .thenReturn(candidateEmail);

        SubmitAnswerRequest request =
                createSubmitAnswerRequest();

        when(interviewService.submitAnswer(
                any(SubmitAnswerRequest.class),
                eq(candidateEmail)
        )).thenReturn(
                createInterviewResponse(31L)
        );

        mockMvc.perform(
                put("/api/v1/interviews/answer")
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

        verify(interviewService)
                .submitAnswer(
                        any(SubmitAnswerRequest.class),
                        eq(candidateEmail)
                );
    }


    // =========================================================
    // COMPLETE INTERVIEW - SUCCESS
    // =========================================================

    @Test
    void completeInterview_ShouldReturn200()
            throws Exception {

        when(authentication.getName())
                .thenReturn(candidateEmail);

        InterviewResponse response =
                createInterviewResponse(40L);

        response.setStatus(
                InterviewStatus.COMPLETED
        );

        when(interviewService.completeInterview(
                40L,
                candidateEmail
        )).thenReturn(response);

        mockMvc.perform(
                put("/api/v1/interviews/40/complete")
                        .principal(authentication)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id")
                .value(40))
        .andExpect(jsonPath("$.status")
                .value("COMPLETED"));
    }


    // =========================================================
    // COMPLETE INTERVIEW - SERVICE CALLED
    // =========================================================

    @Test
    void completeInterview_ShouldCallService()
            throws Exception {

        when(authentication.getName())
                .thenReturn(candidateEmail);

        when(interviewService.completeInterview(
                41L,
                candidateEmail
        )).thenReturn(
                createInterviewResponse(41L)
        );

        mockMvc.perform(
                put("/api/v1/interviews/41/complete")
                        .principal(authentication)
        )
        .andExpect(status().isOk());

        verify(interviewService)
                .completeInterview(
                        41L,
                        candidateEmail
                );
    }


    // =========================================================
    // ADMIN STATISTICS - SUCCESS
    // =========================================================

    @Test
    void getInterviewStatisticsForAdmin_ShouldReturn200()
            throws Exception {

        InterviewStatisticsResponse response =
                InterviewStatisticsResponse.builder()
                        .totalInterviews(100)
                        .completedInterviews(70)
                        .inProgressInterviews(30)
                        .averageScore(78.5)
                        .highestScore(98)
                        .lowestScore(40)
                        .build();

        when(interviewService
                .getInterviewStatisticsForAdmin())
                .thenReturn(response);

        mockMvc.perform(
                get("/api/v1/interviews/admin/statistics")
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalInterviews")
                .value(100))
        .andExpect(jsonPath("$.completedInterviews")
                .value(70))
        .andExpect(jsonPath("$.inProgressInterviews")
                .value(30))
        .andExpect(jsonPath("$.averageScore")
                .value(78.5))
        .andExpect(jsonPath("$.highestScore")
                .value(98))
        .andExpect(jsonPath("$.lowestScore")
                .value(40));
    }


    // =========================================================
    // ADMIN STATISTICS - SERVICE CALLED
    // =========================================================

    @Test
    void getInterviewStatisticsForAdmin_ShouldCallService()
            throws Exception {

        InterviewStatisticsResponse response =
                InterviewStatisticsResponse.builder()
                        .totalInterviews(10)
                        .completedInterviews(5)
                        .inProgressInterviews(5)
                        .averageScore(75.0)
                        .highestScore(90)
                        .lowestScore(50)
                        .build();

        when(interviewService
                .getInterviewStatisticsForAdmin())
                .thenReturn(response);

        mockMvc.perform(
                get("/api/v1/interviews/admin/statistics")
        )
        .andExpect(status().isOk());

        verify(interviewService)
                .getInterviewStatisticsForAdmin();
    }


    // =========================================================
    // ADMIN GET INTERVIEW BY ID
    // =========================================================

    @Test
    void getInterviewByIdForAdmin_ShouldReturn200()
            throws Exception {

        when(interviewService.getInterviewByIdForAdmin(
                50L
        )).thenReturn(
                createInterviewResponse(50L)
        );

        mockMvc.perform(
                get("/api/v1/interviews/admin/50")
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id")
                .value(50))
        .andExpect(jsonPath("$.jobTitle")
                .value("Java Developer"));
    }


    // =========================================================
    // ADMIN GET INTERVIEW BY ID - SERVICE CALLED
    // =========================================================

    @Test
    void getInterviewByIdForAdmin_ShouldCallService()
            throws Exception {

        when(interviewService.getInterviewByIdForAdmin(
                60L
        )).thenReturn(
                createInterviewResponse(60L)
        );

        mockMvc.perform(
                get("/api/v1/interviews/admin/60")
        )
        .andExpect(status().isOk());

        verify(interviewService)
                .getInterviewByIdForAdmin(60L);
    }


    // =========================================================
    // ADMIN GET ALL INTERVIEWS
    // =========================================================

    @Test
    void getAllInterviews_ShouldReturn200()
            throws Exception {

        when(interviewService.getAllInterviews())
                .thenReturn(
                        List.of(
                                createInterviewResponse(1L),
                                createInterviewResponse(2L),
                                createInterviewResponse(3L)
                        )
                );

        mockMvc.perform(
                get("/api/v1/interviews/admin")
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()")
                .value(3));
    }


    // =========================================================
    // ADMIN GET ALL INTERVIEWS - EMPTY
    // =========================================================

    @Test
    void getAllInterviews_ShouldReturnEmptyList()
            throws Exception {

        when(interviewService.getAllInterviews())
                .thenReturn(List.of());

        mockMvc.perform(
                get("/api/v1/interviews/admin")
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()")
                .value(0));

        verify(interviewService)
                .getAllInterviews();
    }


    // =========================================================
    // COMPLETE INTERVIEW RESPONSE DATA
    // =========================================================

    @Test
    void getMyInterviewById_ShouldReturnCompleteData()
            throws Exception {

        when(authentication.getName())
                .thenReturn(candidateEmail);

        InterviewResponse response =
                InterviewResponse.builder()
                        .id(100L)
                        .jobId(500L)
                        .jobTitle("Senior Java Developer")
                        .status(InterviewStatus.IN_PROGRESS)
                        .totalQuestions(10)
                        .score(85)
                        .overallFeedback(
                                "Good technical performance"
                        )
                        .startedAt(
                                LocalDateTime.of(
                                        2026,
                                        8,
                                        15,
                                        10,
                                        30
                                )
                        )
                        .completedAt(null)
                        .questions(
                                List.of(
                                        InterviewQuestionResponse
                                                .builder()
                                                .id(1L)
                                                .questionNumber(1)
                                                .question(
                                                        "What is Spring Boot?"
                                                )
                                                .questionType(
                                                        QuestionType.TECHNICAL
                                                )
                                                .candidateAnswer(
                                                        "A framework for Java"
                                                )
                                                .score(90)
                                                .feedback(
                                                        "Good answer"
                                                )
                                                .build()
                                )
                        )
                        .build();

        when(interviewService.getMyInterviewById(
                100L,
                candidateEmail
        )).thenReturn(response);

        mockMvc.perform(
                get("/api/v1/interviews/100")
                        .principal(authentication)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id")
                .value(100))
        .andExpect(jsonPath("$.jobId")
                .value(500))
        .andExpect(jsonPath("$.jobTitle")
                .value("Senior Java Developer"))
        .andExpect(jsonPath("$.totalQuestions")
                .value(10))
        .andExpect(jsonPath("$.score")
                .value(85))
        .andExpect(jsonPath("$.overallFeedback")
                .value("Good technical performance"))
        .andExpect(jsonPath("$.questions.length()")
                .value(1))
        .andExpect(jsonPath("$.questions[0].id")
                .value(1))
        .andExpect(jsonPath(
                "$.questions[0].question"
        ).value("What is Spring Boot?"));
    }


    // =========================================================
    // HELPERS
    // =========================================================

    private StartInterviewRequest
    createStartInterviewRequest() {

        StartInterviewRequest request =
                new StartInterviewRequest();

        request.setJobId(10L);
        request.setTotalQuestions(5);

        return request;
    }


    private SubmitAnswerRequest
    createSubmitAnswerRequest() {

        SubmitAnswerRequest request =
                new SubmitAnswerRequest();

        request.setQuestionId(1L);
        request.setAnswer(
                "Spring Boot is a Java framework."
        );

        return request;
    }


    private InterviewResponse
    createInterviewResponse(Long id) {

        return InterviewResponse.builder()

                .id(id)

                .jobId(10L)

                .jobTitle(
                        "Java Developer"
                )

                .status(
                        InterviewStatus.IN_PROGRESS
                )

                .totalQuestions(5)

                .score(80)

                .overallFeedback(
                        "Good performance"
                )

                .startedAt(
                        LocalDateTime.of(
                                2026,
                                8,
                                15,
                                10,
                                30
                        )
                )

                .completedAt(null)

                .questions(List.of())

                .build();
    }
}