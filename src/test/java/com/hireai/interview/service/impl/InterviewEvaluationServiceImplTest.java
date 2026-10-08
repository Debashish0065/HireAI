package com.hireai.interview.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
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
import org.springframework.ai.chat.client.ChatClient;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hireai.interview.dto.request.InterviewEvaluationRequest;
import com.hireai.interview.dto.response.InterviewEvaluationResponse;
import com.hireai.interview.entity.Interview;
import com.hireai.interview.entity.InterviewEvaluation;
import com.hireai.interview.entity.InterviewQuestion;
import com.hireai.interview.enums.InterviewStatus;
import com.hireai.interview.repository.InterviewEvaluationRepository;
import com.hireai.interview.repository.InterviewQuestionRepository;
import com.hireai.interview.repository.InterviewRepository;
import com.hireai.user.entity.User;
import com.hireai.user.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class InterviewEvaluationServiceImplTest {

    @Mock
    private InterviewEvaluationRepository evaluationRepository;

    @Mock
    private InterviewQuestionRepository questionRepository;

    @Mock
    private InterviewRepository interviewRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ChatClient.Builder chatClientBuilder;

    @Mock
    private ChatClient chatClient;

    @Mock
    private ChatClient.ChatClientRequestSpec requestSpec;

    @Mock
    private ChatClient.CallResponseSpec responseSpec;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private InterviewEvaluationServiceImpl evaluationService;

    private User candidate;
    private Interview interview;
    private InterviewEvaluation evaluation;
    private InterviewQuestion question1;
    private InterviewQuestion question2;

    @BeforeEach
    void setUp() {

        candidate = User.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .email("candidate@test.com")
                .build();

        interview = Interview.builder()
                .id(100L)
                .candidate(candidate)
                .status(InterviewStatus.COMPLETED)
                .totalQuestions(2)
                .score(85)
                .startedAt(LocalDateTime.now().minusMinutes(30))
                .completedAt(LocalDateTime.now())
                .build();

        question1 = InterviewQuestion.builder()
                .id(1L)
                .interview(interview)
                .questionNumber(1)
                .question("What is Java?")
                .candidateAnswer(
                        "Java is an object-oriented programming language."
                )
                .score(90)
                .feedback("Good technical explanation.")
                .build();

        question2 = InterviewQuestion.builder()
                .id(2L)
                .interview(interview)
                .questionNumber(2)
                .question("What is Spring Boot?")
                .candidateAnswer(
                        "Spring Boot is used to create Spring applications quickly."
                )
                .score(80)
                .feedback("Good answer with relevant information.")
                .build();

        evaluation = InterviewEvaluation.builder()
                .id(500L)
                .interview(interview)
                .overallScore(85)
                .technicalScore(90)
                .communicationScore(80)
                .confidenceScore(85)
                .strengths("Strong technical knowledge")
                .weaknesses("Needs better communication")
                .feedback("Good overall performance")
                .recommendation("Recommended")
                .createdAt(LocalDateTime.now())
                .build();
    }

    // =========================================================
    // GET EVALUATION
    // =========================================================

    @Test
    void getEvaluation_ShouldReturnEvaluation_WhenEvaluationExists() {

        when(userRepository.findByEmail("candidate@test.com"))
                .thenReturn(Optional.of(candidate));

        when(interviewRepository.findByIdAndCandidate(100L, candidate))
                .thenReturn(Optional.of(interview));

        when(evaluationRepository.findByInterview(interview))
                .thenReturn(Optional.of(evaluation));

        InterviewEvaluationResponse response =
                evaluationService.getEvaluation(
                        100L,
                        "candidate@test.com"
                );

        assertNotNull(response);

        assertEquals(500L, response.getId());
        assertEquals(100L, response.getInterviewId());

        assertEquals(85, response.getOverallScore());
        assertEquals(90, response.getTechnicalScore());
        assertEquals(80, response.getCommunicationScore());
        assertEquals(85, response.getConfidenceScore());

        assertEquals(
                "Recommended",
                response.getRecommendation()
        );

        verify(evaluationRepository)
                .findByInterview(interview);
    }

    // =========================================================
    // GET EVALUATION - CANDIDATE NOT FOUND
    // =========================================================

    @Test
    void getEvaluation_ShouldThrowException_WhenCandidateNotFound() {

        when(userRepository.findByEmail("unknown@test.com"))
                .thenReturn(Optional.empty());

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> evaluationService.getEvaluation(
                                100L,
                                "unknown@test.com"
                        )
                );

        assertEquals(
                "Candidate not found.",
                exception.getMessage()
        );
    }

    // =========================================================
    // GET EVALUATION - INTERVIEW NOT FOUND
    // =========================================================

    @Test
    void getEvaluation_ShouldThrowException_WhenInterviewNotFound() {

        when(userRepository.findByEmail("candidate@test.com"))
                .thenReturn(Optional.of(candidate));

        when(interviewRepository.findByIdAndCandidate(100L, candidate))
                .thenReturn(Optional.empty());

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> evaluationService.getEvaluation(
                                100L,
                                "candidate@test.com"
                        )
                );

        assertEquals(
                "Interview not found.",
                exception.getMessage()
        );
    }

    // =========================================================
    // GET EVALUATION - UNAUTHORIZED USER
    // =========================================================

    @Test
    void getEvaluation_ShouldThrowException_WhenUserDoesNotOwnInterview() {

        User anotherUser = User.builder()
                .id(2L)
                .firstName("Another")
                .lastName("User")
                .email("another@test.com")
                .build();

        when(userRepository.findByEmail("another@test.com"))
                .thenReturn(Optional.of(anotherUser));

        when(interviewRepository.findByIdAndCandidate(100L, anotherUser))
                .thenReturn(Optional.empty());

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> evaluationService.getEvaluation(
                                100L,
                                "another@test.com"
                        )
                );

        assertEquals(
                "Interview not found.",
                exception.getMessage()
        );
    }

    // =========================================================
    // GET EVALUATION - EVALUATION NOT FOUND
    // =========================================================

    @Test
    void getEvaluation_ShouldThrowException_WhenEvaluationNotFound() {

        when(userRepository.findByEmail("candidate@test.com"))
                .thenReturn(Optional.of(candidate));

        when(interviewRepository.findByIdAndCandidate(100L, candidate))
                .thenReturn(Optional.of(interview));

        when(evaluationRepository.findByInterview(interview))
                .thenReturn(Optional.empty());

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> evaluationService.getEvaluation(
                                100L,
                                "candidate@test.com"
                        )
                );

        assertEquals(
                "Interview evaluation not found.",
                exception.getMessage()
        );
    }

    // =========================================================
    // GET MY EVALUATIONS
    // =========================================================

    @Test
    void getMyEvaluations_ShouldReturnOnlyCandidateEvaluations() {

        when(userRepository.findByEmail("candidate@test.com"))
                .thenReturn(Optional.of(candidate));

        when(evaluationRepository.findAllByOrderByCreatedAtDesc())
                .thenReturn(List.of(evaluation));

        List<InterviewEvaluationResponse> responses =
                evaluationService.getMyEvaluations(
                        "candidate@test.com"
                );

        assertNotNull(responses);
        assertEquals(1, responses.size());

        assertEquals(
                500L,
                responses.get(0).getId()
        );

        assertEquals(
                85,
                responses.get(0).getOverallScore()
        );

        verify(evaluationRepository)
                .findAllByOrderByCreatedAtDesc();
    }

    // =========================================================
    // GET MY EVALUATIONS - CANDIDATE NOT FOUND
    // =========================================================

    @Test
    void getMyEvaluations_ShouldThrowException_WhenCandidateNotFound() {

        when(userRepository.findByEmail("unknown@test.com"))
                .thenReturn(Optional.empty());

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> evaluationService.getMyEvaluations(
                                "unknown@test.com"
                        )
                );

        assertEquals(
                "Candidate not found.",
                exception.getMessage()
        );
    }

    // =========================================================
    // EVALUATE INTERVIEW - EXISTING EVALUATION
    // =========================================================

    @Test
    void evaluateInterview_ShouldReturnExistingEvaluation() {

        InterviewEvaluationRequest request =
                new InterviewEvaluationRequest();

        request.setInterviewId(100L);

        when(userRepository.findByEmail("candidate@test.com"))
                .thenReturn(Optional.of(candidate));

        when(interviewRepository.findByIdAndCandidate(100L, candidate))
                .thenReturn(Optional.of(interview));

        when(evaluationRepository.findByInterview(interview))
                .thenReturn(Optional.of(evaluation));

        InterviewEvaluationResponse response =
                evaluationService.evaluateInterview(
                        request,
                        "candidate@test.com"
                );

        assertNotNull(response);

        assertEquals(
                500L,
                response.getId()
        );

        assertEquals(
                85,
                response.getOverallScore()
        );

        verify(evaluationRepository, never())
                .save(any(InterviewEvaluation.class));
    }

    // =========================================================
    // EVALUATE INTERVIEW - NO QUESTIONS
    // =========================================================

    @Test
    void evaluateInterview_ShouldThrowException_WhenNoQuestionsExist() {

        InterviewEvaluationRequest request =
                new InterviewEvaluationRequest();

        request.setInterviewId(100L);

        when(userRepository.findByEmail("candidate@test.com"))
                .thenReturn(Optional.of(candidate));

        when(interviewRepository.findByIdAndCandidate(100L, candidate))
                .thenReturn(Optional.of(interview));

        when(evaluationRepository.findByInterview(interview))
                .thenReturn(Optional.empty());

        when(questionRepository.findByInterviewOrderByQuestionNumberAsc(interview))
                .thenReturn(List.of());

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> evaluationService.evaluateInterview(
                                request,
                                "candidate@test.com"
                        )
                );

        assertEquals(
                "No interview questions found.",
                exception.getMessage()
        );
    }

    // =========================================================
    // EVALUATE INTERVIEW - INTERVIEW NOT FOUND
    // =========================================================

    @Test
    void evaluateInterview_ShouldThrowException_WhenInterviewDoesNotExist() {

        InterviewEvaluationRequest request =
                new InterviewEvaluationRequest();

        request.setInterviewId(999L);

        when(userRepository.findByEmail("candidate@test.com"))
                .thenReturn(Optional.of(candidate));

        when(interviewRepository.findByIdAndCandidate(999L, candidate))
                .thenReturn(Optional.empty());

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> evaluationService.evaluateInterview(
                                request,
                                "candidate@test.com"
                        )
                );

        assertEquals(
                "Interview not found.",
                exception.getMessage()
        );
    }

    // =========================================================
    // EVALUATE INTERVIEW - UNAUTHORIZED USER
    // =========================================================

    @Test
    void evaluateInterview_ShouldThrowException_WhenUserDoesNotOwnInterview() {

        User anotherUser = User.builder()
                .id(2L)
                .firstName("Another")
                .lastName("User")
                .email("another@test.com")
                .build();

        when(userRepository.findByEmail("another@test.com"))
                .thenReturn(Optional.of(anotherUser));

        when(interviewRepository.findByIdAndCandidate(100L, anotherUser))
                .thenReturn(Optional.empty());

        InterviewEvaluationRequest request =
                new InterviewEvaluationRequest();

        request.setInterviewId(100L);

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> evaluationService.evaluateInterview(
                                request,
                                "another@test.com"
                        )
                );

        assertEquals(
                "Interview not found.",
                exception.getMessage()
        );
    }

    // =========================================================
    // EVALUATE INTERVIEW - INTERVIEW NOT COMPLETED
    // =========================================================

    @Test
    void evaluateInterview_ShouldThrowException_WhenInterviewIsNotCompleted() {

        InterviewEvaluationRequest request =
                new InterviewEvaluationRequest();

        request.setInterviewId(100L);

        interview.setStatus(InterviewStatus.IN_PROGRESS);

        when(userRepository.findByEmail("candidate@test.com"))
                .thenReturn(Optional.of(candidate));

        when(interviewRepository.findByIdAndCandidate(100L, candidate))
                .thenReturn(Optional.of(interview));

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> evaluationService.evaluateInterview(
                                request,
                                "candidate@test.com"
                        )
                );

        assertEquals(
                "Interview must be completed before evaluation.",
                exception.getMessage()
        );

        verify(evaluationRepository, never())
                .findByInterview(interview);

        verify(questionRepository, never())
                .findByInterviewOrderByQuestionNumberAsc(interview);
    }

    // =========================================================
    // EVALUATE INTERVIEW - QUESTIONS EXIST
    // =========================================================

    @Test
    void evaluateInterview_ShouldUseInterviewQuestions() {

        InterviewEvaluationRequest request =
                new InterviewEvaluationRequest();

        request.setInterviewId(100L);

        when(userRepository.findByEmail("candidate@test.com"))
                .thenReturn(Optional.of(candidate));

        when(interviewRepository.findByIdAndCandidate(100L, candidate))
                .thenReturn(Optional.of(interview));

        when(evaluationRepository.findByInterview(interview))
                .thenReturn(Optional.empty());

        when(questionRepository.findByInterviewOrderByQuestionNumberAsc(interview))
                .thenReturn(List.of(question1, question2));

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> evaluationService.evaluateInterview(
                                request,
                                "candidate@test.com"
                        )
                );

        /*
         * The test reaches the AI evaluation stage.
         * Since no ChatClient response is configured in this unit test,
         * the service is expected to fail before saving an evaluation.
         */
        assertNotNull(exception);

        verify(questionRepository)
                .findByInterviewOrderByQuestionNumberAsc(interview);
    }

    // =========================================================
    // SCORE MAPPING
    // =========================================================

    @Test
    void getEvaluation_ShouldMapAllEvaluationFieldsCorrectly() {

        when(userRepository.findByEmail("candidate@test.com"))
                .thenReturn(Optional.of(candidate));

        when(interviewRepository.findByIdAndCandidate(100L, candidate))
                .thenReturn(Optional.of(interview));

        when(evaluationRepository.findByInterview(interview))
                .thenReturn(Optional.of(evaluation));

        InterviewEvaluationResponse response =
                evaluationService.getEvaluation(
                        100L,
                        "candidate@test.com"
                );

        assertEquals(
                "Strong technical knowledge",
                response.getStrengths()
        );

        assertEquals(
                "Needs better communication",
                response.getWeaknesses()
        );

        assertEquals(
                "Good overall performance",
                response.getFeedback()
        );

        assertEquals(
                "Recommended",
                response.getRecommendation()
        );

        assertNotNull(response.getCreatedAt());
    }
}