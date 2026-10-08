package com.hireai.interview.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hireai.interview.dto.request.StartInterviewRequest;
import com.hireai.interview.dto.request.SubmitAnswerRequest;
import com.hireai.interview.dto.response.InterviewResponse;
import com.hireai.interview.dto.response.InterviewStatisticsResponse;
import com.hireai.interview.entity.Interview;
import com.hireai.interview.entity.InterviewQuestion;
import com.hireai.interview.enums.InterviewStatus;
import com.hireai.interview.enums.QuestionType;
import com.hireai.interview.repository.InterviewQuestionRepository;
import com.hireai.interview.repository.InterviewRepository;
import com.hireai.job.entity.Job;
import com.hireai.job.enums.JobType;
import com.hireai.job.repository.JobRepository;
import com.hireai.user.entity.User;
import com.hireai.user.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.ai.chat.client.ChatClient;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InterviewServiceImplTest {

    @Mock
    private InterviewRepository interviewRepository;

    @Mock
    private InterviewQuestionRepository questionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JobRepository jobRepository;

    @Mock
    private ChatClient.Builder chatClientBuilder;

    @Mock
    private ChatClient chatClient;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private InterviewServiceImpl interviewService;

    private User candidate;
    private User hr;
    private Job job;
    private Interview interview;
    private InterviewQuestion question;

    @BeforeEach
    void setUp() {

        candidate = User.builder()
                .id(1L)
                .firstName("Test")
                .lastName("Candidate")
                .email("candidate@gmail.com")
                .build();

        hr = User.builder()
                .id(2L)
                .firstName("Test")
                .lastName("HR")
                .email("hr@gmail.com")
                .build();

        job = Job.builder()
                .id(10L)
                .title("Java Developer")
                .description("Java Spring Boot Developer")
                .companyName("HireAI")
                .location("Bangalore")
                .jobType(JobType.FULL_TIME)
                .hr(hr)
                .build();

        interview = Interview.builder()
                .id(100L)
                .candidate(candidate)
                .job(job)
                .status(InterviewStatus.IN_PROGRESS)
                .totalQuestions(5)
                .score(0)
                .build();

        question = InterviewQuestion.builder()
                .id(1000L)
                .interview(interview)
                .questionNumber(1)
                .question("What is Spring Boot?")
                .questionType(QuestionType.TECHNICAL)
                .build();
    }

    // =========================================================
    // START INTERVIEW
    // =========================================================

    @Test
    void startInterview_ShouldThrowException_WhenRequestIsNull() {

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> interviewService.startInterview(
                        null,
                        "candidate@gmail.com"
                )
        );

        assertEquals(
                "Interview request is required.",
                exception.getMessage()
        );
    }

    @Test
    void startInterview_ShouldThrowException_WhenJobIdIsMissing() {

        StartInterviewRequest request =
                new StartInterviewRequest();

        request.setJobId(null);

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> interviewService.startInterview(
                        request,
                        "candidate@gmail.com"
                )
        );

        assertEquals(
                "Job ID must be greater than 0.",
                exception.getMessage()
        );
    }

    @Test
    void startInterview_ShouldThrowException_WhenCandidateDoesNotExist() {

        StartInterviewRequest request =
                new StartInterviewRequest();

        request.setJobId(10L);

        when(userRepository.findByEmail("candidate@gmail.com"))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> interviewService.startInterview(
                        request,
                        "candidate@gmail.com"
                )
        );

        assertEquals(
                "Candidate not found.",
                exception.getMessage()
        );
    }

    @Test
    void startInterview_ShouldThrowException_WhenJobDoesNotExist() {

        StartInterviewRequest request =
                new StartInterviewRequest();

        request.setJobId(10L);

        when(userRepository.findByEmail("candidate@gmail.com"))
                .thenReturn(Optional.of(candidate));

        when(jobRepository.findById(10L))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> interviewService.startInterview(
                        request,
                        "candidate@gmail.com"
                )
        );

        assertEquals(
                "Job not found.",
                exception.getMessage()
        );
    }

    @Test
    void startInterview_ShouldThrowException_WhenQuestionCountIsInvalid() {

        StartInterviewRequest request =
                new StartInterviewRequest();

        request.setJobId(10L);
        request.setTotalQuestions(11);

        when(userRepository.findByEmail("candidate@gmail.com"))
                .thenReturn(Optional.of(candidate));

        when(jobRepository.findById(10L))
                .thenReturn(Optional.of(job));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> interviewService.startInterview(
                        request,
                        "candidate@gmail.com"
                )
        );

        assertEquals(
                "Total questions must be between 1 and 10.",
                exception.getMessage()
        );
    }

    @Test
    void startInterview_ShouldThrowException_WhenActiveInterviewAlreadyExists() {

        StartInterviewRequest request =
                new StartInterviewRequest();

        request.setJobId(10L);
        request.setTotalQuestions(5);

        when(userRepository.findByEmail("candidate@gmail.com"))
                .thenReturn(Optional.of(candidate));

        when(jobRepository.findById(10L))
                .thenReturn(Optional.of(job));

        when(interviewRepository.findByCandidate(candidate))
                .thenReturn(List.of(interview));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> interviewService.startInterview(
                        request,
                        "candidate@gmail.com"
                )
        );

        assertEquals(
                "You already have an active interview for this job.",
                exception.getMessage()
        );
    }

    // =========================================================
    // GET MY INTERVIEWS
    // =========================================================

    @Test
    void getMyInterviews_ShouldReturnInterviews_WhenCandidateExists() {

        when(userRepository.findByEmail("candidate@gmail.com"))
                .thenReturn(Optional.of(candidate));

        when(interviewRepository.findByCandidate(candidate))
                .thenReturn(List.of());

        List<InterviewResponse> result =
                interviewService.getMyInterviews(
                        "candidate@gmail.com"
                );

        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(userRepository)
                .findByEmail("candidate@gmail.com");

        verify(interviewRepository)
                .findByCandidate(candidate);
    }

    @Test
    void getMyInterviews_ShouldThrowException_WhenCandidateDoesNotExist() {

        when(userRepository.findByEmail("candidate@gmail.com"))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> interviewService.getMyInterviews(
                        "candidate@gmail.com"
                )
        );

        assertEquals(
                "Candidate not found.",
                exception.getMessage()
        );
    }

    // =========================================================
    // GET MY INTERVIEW BY ID
    // =========================================================

    @Test
    void getMyInterviewById_ShouldThrowException_WhenInterviewDoesNotExist() {

        when(userRepository.findByEmail("candidate@gmail.com"))
                .thenReturn(Optional.of(candidate));

        when(interviewRepository.findByIdAndCandidate(
                100L,
                candidate
        )).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> interviewService.getMyInterviewById(
                        100L,
                        "candidate@gmail.com"
                )
        );

        assertEquals(
                "Interview not found.",
                exception.getMessage()
        );
    }

    // =========================================================
    // ADMIN - GET INTERVIEW
    // =========================================================

    @Test
    void getInterviewByIdForAdmin_ShouldThrowException_WhenInterviewDoesNotExist() {

        when(interviewRepository.findById(100L))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> interviewService.getInterviewByIdForAdmin(100L)
        );

        assertEquals(
                "Interview not found.",
                exception.getMessage()
        );
    }

    // =========================================================
    // ADMIN - GET ALL INTERVIEWS
    // =========================================================

    @Test
    void getAllInterviews_ShouldReturnEmptyList_WhenNoInterviewsExist() {

        when(interviewRepository.findAll())
                .thenReturn(List.of());

        List<InterviewResponse> result =
                interviewService.getAllInterviews();

        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(interviewRepository)
                .findAll();
    }

    // =========================================================
    // ADMIN - STATISTICS
    // =========================================================

    @Test
    void getInterviewStatisticsForAdmin_ShouldReturnZero_WhenNoInterviewsExist() {

        when(interviewRepository.findAll())
                .thenReturn(List.of());

        InterviewStatisticsResponse result =
                interviewService
                        .getInterviewStatisticsForAdmin();

        assertNotNull(result);

        assertEquals(
                0,
                result.getTotalInterviews()
        );

        assertEquals(
                0,
                result.getCompletedInterviews()
        );

        assertEquals(
                0,
                result.getInProgressInterviews()
        );

        assertEquals(
                0.0,
                result.getAverageScore()
        );

        assertEquals(
                0,
                result.getHighestScore()
        );

        assertEquals(
                0,
                result.getLowestScore()
        );
    }

    @Test
    void getInterviewStatisticsForAdmin_ShouldCalculateStatistics() {

        Interview completed =
                Interview.builder()
                        .id(101L)
                        .candidate(candidate)
                        .job(job)
                        .status(InterviewStatus.COMPLETED)
                        .totalQuestions(5)
                        .score(80)
                        .build();

        Interview inProgress =
                Interview.builder()
                        .id(102L)
                        .candidate(candidate)
                        .job(job)
                        .status(InterviewStatus.IN_PROGRESS)
                        .totalQuestions(5)
                        .score(60)
                        .build();

        when(interviewRepository.findAll())
                .thenReturn(
                        List.of(
                                completed,
                                inProgress
                        )
                );

        InterviewStatisticsResponse result =
                interviewService
                        .getInterviewStatisticsForAdmin();

        assertEquals(
                2,
                result.getTotalInterviews()
        );

        assertEquals(
                1,
                result.getCompletedInterviews()
        );

        assertEquals(
                1,
                result.getInProgressInterviews()
        );

        assertEquals(
                70.0,
                result.getAverageScore()
        );

        assertEquals(
                80,
                result.getHighestScore()
        );

        assertEquals(
                60,
                result.getLowestScore()
        );
    }

    // =========================================================
    // SUBMIT ANSWER - VALIDATION
    // =========================================================

    @Test
    void submitAnswer_ShouldThrowException_WhenRequestIsNull() {

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> interviewService.submitAnswer(
                        null,
                        "candidate@gmail.com"
                )
        );

        assertEquals(
                "Answer request is required.",
                exception.getMessage()
        );
    }

    @Test
    void submitAnswer_ShouldThrowException_WhenQuestionIdIsMissing() {

        SubmitAnswerRequest request =
                new SubmitAnswerRequest();

        request.setQuestionId(null);
        request.setAnswer("Spring Boot is a framework.");

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> interviewService.submitAnswer(
                        request,
                        "candidate@gmail.com"
                )
        );

        assertEquals(
                "Question ID must be greater than 0.",
                exception.getMessage()
        );
    }

    @Test
    void submitAnswer_ShouldThrowException_WhenAnswerIsEmpty() {

        SubmitAnswerRequest request =
                new SubmitAnswerRequest();

        request.setQuestionId(1000L);
        request.setAnswer("");

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> interviewService.submitAnswer(
                        request,
                        "candidate@gmail.com"
                )
        );

        assertEquals(
                "Answer cannot be empty.",
                exception.getMessage()
        );
    }

    @Test
    void submitAnswer_ShouldThrowException_WhenCandidateDoesNotExist() {

        SubmitAnswerRequest request =
                new SubmitAnswerRequest();

        request.setQuestionId(1000L);
        request.setAnswer("Spring Boot is a framework.");

        when(userRepository.findByEmail("candidate@gmail.com"))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> interviewService.submitAnswer(
                        request,
                        "candidate@gmail.com"
                )
        );

        assertEquals(
                "Candidate not found.",
                exception.getMessage()
        );
    }

    @Test
    void submitAnswer_ShouldThrowException_WhenQuestionDoesNotExist() {

        SubmitAnswerRequest request =
                new SubmitAnswerRequest();

        request.setQuestionId(1000L);
        request.setAnswer("Spring Boot is a framework.");

        when(userRepository.findByEmail("candidate@gmail.com"))
                .thenReturn(Optional.of(candidate));

        when(questionRepository.findById(1000L))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> interviewService.submitAnswer(
                        request,
                        "candidate@gmail.com"
                )
        );

        assertEquals(
                "Question not found.",
                exception.getMessage()
        );
    }

    @Test
    void submitAnswer_ShouldThrowException_WhenCandidateDoesNotOwnInterview() {

        User anotherCandidate =
                User.builder()
                        .id(99L)
                        .firstName("Other")
                        .lastName("Candidate")
                        .email("other@gmail.com")
                        .build();

        Interview anotherInterview =
                Interview.builder()
                        .id(200L)
                        .candidate(anotherCandidate)
                        .job(job)
                        .status(InterviewStatus.IN_PROGRESS)
                        .totalQuestions(5)
                        .score(0)
                        .build();

        InterviewQuestion anotherQuestion =
                InterviewQuestion.builder()
                        .id(2000L)
                        .interview(anotherInterview)
                        .questionNumber(1)
                        .question("What is Java?")
                        .questionType(QuestionType.TECHNICAL)
                        .build();

        SubmitAnswerRequest request =
                new SubmitAnswerRequest();

        request.setQuestionId(2000L);
        request.setAnswer("Java is a programming language.");

        when(userRepository.findByEmail("candidate@gmail.com"))
                .thenReturn(Optional.of(candidate));

        when(questionRepository.findById(2000L))
                .thenReturn(Optional.of(anotherQuestion));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> interviewService.submitAnswer(
                        request,
                        "candidate@gmail.com"
                )
        );

        assertEquals(
                "You cannot answer this question.",
                exception.getMessage()
        );
    }

    @Test
    void submitAnswer_ShouldThrowException_WhenInterviewIsNotInProgress() {

        interview.setStatus(InterviewStatus.COMPLETED);

        SubmitAnswerRequest request =
                new SubmitAnswerRequest();

        request.setQuestionId(1000L);
        request.setAnswer("Spring Boot is a framework.");

        when(userRepository.findByEmail("candidate@gmail.com"))
                .thenReturn(Optional.of(candidate));

        when(questionRepository.findById(1000L))
                .thenReturn(Optional.of(question));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> interviewService.submitAnswer(
                        request,
                        "candidate@gmail.com"
                )
        );

        assertEquals(
                "Interview is not in progress.",
                exception.getMessage()
        );
    }

    // =========================================================
    // COMPLETE INTERVIEW
    // =========================================================

    @Test
    void completeInterview_ShouldThrowException_WhenCandidateDoesNotExist() {

        when(userRepository.findByEmail("candidate@gmail.com"))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> interviewService.completeInterview(
                        100L,
                        "candidate@gmail.com"
                )
        );

        assertEquals(
                "Candidate not found.",
                exception.getMessage()
        );
    }

    @Test
    void completeInterview_ShouldThrowException_WhenInterviewDoesNotExist() {

        when(userRepository.findByEmail("candidate@gmail.com"))
                .thenReturn(Optional.of(candidate));

        when(interviewRepository.findByIdAndCandidate(
                100L,
                candidate
        )).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> interviewService.completeInterview(
                        100L,
                        "candidate@gmail.com"
                )
        );

        assertEquals(
                "Interview not found.",
                exception.getMessage()
        );
    }

    @Test
    void completeInterview_ShouldThrowException_WhenInterviewAlreadyCompleted() {

        interview.setStatus(InterviewStatus.COMPLETED);

        when(userRepository.findByEmail("candidate@gmail.com"))
                .thenReturn(Optional.of(candidate));

        when(interviewRepository.findByIdAndCandidate(
                100L,
                candidate
        )).thenReturn(Optional.of(interview));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> interviewService.completeInterview(
                        100L,
                        "candidate@gmail.com"
                )
        );

        assertEquals(
                "Interview is already completed or is not in progress.",
                exception.getMessage()
        );
    }

    @Test
    void completeInterview_ShouldThrowException_WhenNotAllQuestionsAreAnswered() {

        when(userRepository.findByEmail("candidate@gmail.com"))
                .thenReturn(Optional.of(candidate));

        when(interviewRepository.findByIdAndCandidate(
                100L,
                candidate
        )).thenReturn(Optional.of(interview));

        when(questionRepository
                .findByInterviewOrderByQuestionNumberAsc(interview))
                .thenReturn(
                        List.of(question)
                );

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> interviewService.completeInterview(
                        100L,
                        "candidate@gmail.com"
                )
        );

        assertEquals(
                "Please answer all interview questions before completing.",
                exception.getMessage()
        );
    }
}