
package com.hireai.match.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.chat.client.ChatClient;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hireai.job.entity.Job;
import com.hireai.job.repository.JobRepository;
import com.hireai.match.dto.request.JobMatchRequest;
import com.hireai.match.dto.response.JobMatchResponse;
import com.hireai.match.entity.JobMatch;
import com.hireai.match.repository.JobMatchRepository;
import com.hireai.resume.entity.Resume;
import com.hireai.resume.repository.ResumeRepository;
import com.hireai.user.entity.User;
import com.hireai.user.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class JobMatchServiceImplTest {

    @Mock
    private JobMatchRepository jobMatchRepository;

    @Mock
    private ResumeRepository resumeRepository;

    @Mock
    private JobRepository jobRepository;

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

    private ObjectMapper objectMapper;

    private JobMatchServiceImpl jobMatchService;

    private User candidate;

    private Resume resume;

    private Job job;

    private JobMatch jobMatch;

    private JobMatchRequest request;


    // =========================================================
    // SETUP
    // =========================================================

    @BeforeEach
    void setUp() {

        candidate = User.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .email("candidate@test.com")
                .build();


        job = Job.builder()
                .id(10L)
                .title("Java Developer")
                .companyName("HireAI")
                .location("Bangalore")
                .description("Java Spring Boot Developer")
                .build();


        resume = Resume.builder()
                .id(100L)
                .candidate(candidate)
                .fileName("resume.pdf")
                .extractedText(
                        "Java developer with Spring Boot, MySQL and REST API experience."
                )
                .build();


        jobMatch = JobMatch.builder()
                .id(1000L)
                .resume(resume)
                .job(job)
                .matchScore(85)
                .matchingSkills(
                        "Java, Spring Boot, MySQL"
                )
                .missingSkills("Docker")
                .strengths(
                        "Strong backend development experience"
                )
                .recommendation(
                        "Highly Recommended"
                )
                .build();


        request = new JobMatchRequest();

        request.setResumeId(100L);
        request.setJobId(10L);


        // -----------------------------------------------------
        // REAL OBJECT MAPPER
        // -----------------------------------------------------

        objectMapper = new ObjectMapper();


        // -----------------------------------------------------
        // IMPORTANT:
        // Service constructor calls chatClientBuilder.build()
        // -----------------------------------------------------

        when(chatClientBuilder.build())
                .thenReturn(chatClient);


        // -----------------------------------------------------
        // MANUALLY CREATE SERVICE
        // -----------------------------------------------------

        jobMatchService =
                new JobMatchServiceImpl(
                        jobMatchRepository,
                        resumeRepository,
                        jobRepository,
                        userRepository,
                        chatClientBuilder,
                        objectMapper
                );
    }


    // =========================================================
    // MATCH RESUME WITH JOB
    // =========================================================

    @Test
    void matchResumeWithJob_ShouldThrowException_WhenCandidateNotFound() {

        when(userRepository.findByEmail(
                "candidate@test.com"
        )).thenReturn(Optional.empty());


        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> jobMatchService.matchResumeWithJob(
                                request,
                                "candidate@test.com"
                        )
                );


        assertEquals(
                "Candidate not found",
                exception.getMessage()
        );


        verify(resumeRepository, never())
                .findByIdAndCandidate(any(), any());
    }


    @Test
    void matchResumeWithJob_ShouldThrowException_WhenResumeNotFound() {

        when(userRepository.findByEmail(
                "candidate@test.com"
        )).thenReturn(Optional.of(candidate));


        when(resumeRepository.findByIdAndCandidate(
                100L,
                candidate
        )).thenReturn(Optional.empty());


        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> jobMatchService.matchResumeWithJob(
                                request,
                                "candidate@test.com"
                        )
                );


        assertEquals(
                "Resume not found",
                exception.getMessage()
        );
    }


    @Test
    void matchResumeWithJob_ShouldThrowException_WhenResumeTextIsEmpty() {

        resume.setExtractedText("");


        when(userRepository.findByEmail(
                "candidate@test.com"
        )).thenReturn(Optional.of(candidate));


        when(resumeRepository.findByIdAndCandidate(
                100L,
                candidate
        )).thenReturn(Optional.of(resume));


        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> jobMatchService.matchResumeWithJob(
                                request,
                                "candidate@test.com"
                        )
                );


        assertEquals(
                "No extracted text found in resume.",
                exception.getMessage()
        );
    }


    @Test
    void matchResumeWithJob_ShouldThrowException_WhenJobNotFound() {

        when(userRepository.findByEmail(
                "candidate@test.com"
        )).thenReturn(Optional.of(candidate));


        when(resumeRepository.findByIdAndCandidate(
                100L,
                candidate
        )).thenReturn(Optional.of(resume));


        when(jobRepository.findById(10L))
                .thenReturn(Optional.empty());


        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> jobMatchService.matchResumeWithJob(
                                request,
                                "candidate@test.com"
                        )
                );


        assertEquals(
                "Job not found",
                exception.getMessage()
        );
    }


    @Test
    void matchResumeWithJob_ShouldReturnExistingMatch() {

        when(userRepository.findByEmail(
                "candidate@test.com"
        )).thenReturn(Optional.of(candidate));


        when(resumeRepository.findByIdAndCandidate(
                100L,
                candidate
        )).thenReturn(Optional.of(resume));


        when(jobRepository.findById(10L))
                .thenReturn(Optional.of(job));


        when(jobMatchRepository.findByResumeAndJob(
                resume,
                job
        )).thenReturn(Optional.of(jobMatch));


        JobMatchResponse response =
                jobMatchService.matchResumeWithJob(
                        request,
                        "candidate@test.com"
                );


        assertNotNull(response);

        assertEquals(
                1000L,
                response.getId()
        );

        assertEquals(
                100L,
                response.getResumeId()
        );

        assertEquals(
                10L,
                response.getJobId()
        );

        assertEquals(
                "Java Developer",
                response.getJobTitle()
        );

        assertEquals(
                "HireAI",
                response.getCompanyName()
        );

        assertEquals(
                85,
                response.getMatchScore()
        );

        assertEquals(
                "Highly Recommended",
                response.getRecommendation()
        );


        verify(chatClient, never())
                .prompt();


        verify(jobMatchRepository, never())
                .save(any());
    }


    @Test
    void matchResumeWithJob_ShouldCreateMatch_WhenNoExistingMatch() {

        when(userRepository.findByEmail(
                "candidate@test.com"
        )).thenReturn(Optional.of(candidate));


        when(resumeRepository.findByIdAndCandidate(
                100L,
                candidate
        )).thenReturn(Optional.of(resume));


        when(jobRepository.findById(10L))
                .thenReturn(Optional.of(job));


        when(jobMatchRepository.findByResumeAndJob(
                resume,
                job
        )).thenReturn(Optional.empty());


        // -----------------------------------------------------
        // MOCK CHAT CLIENT CHAIN
        // -----------------------------------------------------

        when(chatClient.prompt())
                .thenReturn(requestSpec);


        when(requestSpec.user(any(String.class)))
                .thenReturn(requestSpec);


        when(requestSpec.call())
                .thenReturn(responseSpec);


        when(responseSpec.content())
                .thenReturn("""
                        {
                          "matchScore": 85,
                          "matchingSkills": "Java, Spring Boot, MySQL",
                          "missingSkills": "Docker",
                          "strengths": "Strong backend development experience",
                          "recommendation": "Highly Recommended"
                        }
                        """);


        JobMatch savedMatch =
                JobMatch.builder()
                        .id(1000L)
                        .resume(resume)
                        .job(job)
                        .matchScore(85)
                        .matchingSkills(
                                "Java, Spring Boot, MySQL"
                        )
                        .missingSkills("Docker")
                        .strengths(
                                "Strong backend development experience"
                        )
                        .recommendation(
                                "Highly Recommended"
                        )
                        .build();


        when(jobMatchRepository.save(
                any(JobMatch.class)
        )).thenReturn(savedMatch);


        JobMatchResponse response =
                jobMatchService.matchResumeWithJob(
                        request,
                        "candidate@test.com"
                );


        assertNotNull(response);


        assertEquals(
                85,
                response.getMatchScore()
        );


        assertEquals(
                "Java, Spring Boot, MySQL",
                response.getMatchingSkills()
        );


        assertEquals(
                "Docker",
                response.getMissingSkills()
        );


        assertEquals(
                "Highly Recommended",
                response.getRecommendation()
        );


        verify(chatClient)
                .prompt();


        verify(jobMatchRepository)
                .save(any(JobMatch.class));
    }


    @Test
    void matchResumeWithJob_ShouldThrowException_WhenAIResponseIsEmpty() {

        when(userRepository.findByEmail(
                "candidate@test.com"
        )).thenReturn(Optional.of(candidate));


        when(resumeRepository.findByIdAndCandidate(
                100L,
                candidate
        )).thenReturn(Optional.of(resume));


        when(jobRepository.findById(10L))
                .thenReturn(Optional.of(job));


        when(jobMatchRepository.findByResumeAndJob(
                resume,
                job
        )).thenReturn(Optional.empty());


        // -----------------------------------------------------
        // MOCK CHAT CLIENT
        // -----------------------------------------------------

        when(chatClient.prompt())
                .thenReturn(requestSpec);


        when(requestSpec.user(any(String.class)))
                .thenReturn(requestSpec);


        when(requestSpec.call())
                .thenReturn(responseSpec);


        when(responseSpec.content())
                .thenReturn("");


        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> jobMatchService.matchResumeWithJob(
                                request,
                                "candidate@test.com"
                        )
                );


        assertEquals(
                "AI returned an empty response.",
                exception.getMessage()
        );


        verify(jobMatchRepository, never())
                .save(any());
    }


    @Test
    void matchResumeWithJob_ShouldClampScoreTo100() {

        when(userRepository.findByEmail(
                "candidate@test.com"
        )).thenReturn(Optional.of(candidate));


        when(resumeRepository.findByIdAndCandidate(
                100L,
                candidate
        )).thenReturn(Optional.of(resume));


        when(jobRepository.findById(10L))
                .thenReturn(Optional.of(job));


        when(jobMatchRepository.findByResumeAndJob(
                resume,
                job
        )).thenReturn(Optional.empty());


        when(chatClient.prompt())
                .thenReturn(requestSpec);


        when(requestSpec.user(any(String.class)))
                .thenReturn(requestSpec);


        when(requestSpec.call())
                .thenReturn(responseSpec);


        when(responseSpec.content())
                .thenReturn("""
                        {
                          "matchScore": 150,
                          "matchingSkills": "Java",
                          "missingSkills": "",
                          "strengths": "Good",
                          "recommendation": "Highly Recommended"
                        }
                        """);


        when(jobMatchRepository.save(
                any(JobMatch.class)
        )).thenAnswer(invocation -> {

            JobMatch match =
                    invocation.getArgument(0);

            match.setId(1000L);

            return match;
        });


        JobMatchResponse response =
                jobMatchService.matchResumeWithJob(
                        request,
                        "candidate@test.com"
                );


        assertEquals(
                100,
                response.getMatchScore()
        );
    }


    @Test
    void matchResumeWithJob_ShouldClampScoreTo0() {

        when(userRepository.findByEmail(
                "candidate@test.com"
        )).thenReturn(Optional.of(candidate));


        when(resumeRepository.findByIdAndCandidate(
                100L,
                candidate
        )).thenReturn(Optional.of(resume));


        when(jobRepository.findById(10L))
                .thenReturn(Optional.of(job));


        when(jobMatchRepository.findByResumeAndJob(
                resume,
                job
        )).thenReturn(Optional.empty());


        when(chatClient.prompt())
                .thenReturn(requestSpec);


        when(requestSpec.user(any(String.class)))
                .thenReturn(requestSpec);


        when(requestSpec.call())
                .thenReturn(responseSpec);


        when(responseSpec.content())
                .thenReturn("""
                        {
                          "matchScore": -20,
                          "matchingSkills": "Java",
                          "missingSkills": "Docker",
                          "strengths": "Good",
                          "recommendation": "Moderate Match"
                        }
                        """);


        when(jobMatchRepository.save(
                any(JobMatch.class)
        )).thenAnswer(invocation -> {

            JobMatch match =
                    invocation.getArgument(0);

            match.setId(1000L);

            return match;
        });


        JobMatchResponse response =
                jobMatchService.matchResumeWithJob(
                        request,
                        "candidate@test.com"
                );


        assertEquals(
                0,
                response.getMatchScore()
        );
    }


    // =========================================================
    // GET MY MATCHES
    // =========================================================

    @Test
    void getMyMatches_ShouldThrowException_WhenCandidateNotFound() {

        when(userRepository.findByEmail(
                "candidate@test.com"
        )).thenReturn(Optional.empty());


        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> jobMatchService.getMyMatches(
                                "candidate@test.com"
                        )
                );


        assertEquals(
                "Candidate not found",
                exception.getMessage()
        );
    }


    @Test
    void getMyMatches_ShouldReturnMatches() {

        when(userRepository.findByEmail(
                "candidate@test.com"
        )).thenReturn(Optional.of(candidate));


        when(resumeRepository.findByCandidate(candidate))
                .thenReturn(List.of(resume));


        when(jobMatchRepository.findByResume(resume))
                .thenReturn(List.of(jobMatch));


        List<JobMatchResponse> responses =
                jobMatchService.getMyMatches(
                        "candidate@test.com"
                );


        assertNotNull(responses);

        assertEquals(
                1,
                responses.size()
        );


        assertEquals(
                1000L,
                responses.get(0).getId()
        );


        assertEquals(
                85,
                responses.get(0).getMatchScore()
        );
    }


    @Test
    void getMyMatches_ShouldReturnEmptyList_WhenNoResumes() {

        when(userRepository.findByEmail(
                "candidate@test.com"
        )).thenReturn(Optional.of(candidate));


        when(resumeRepository.findByCandidate(candidate))
                .thenReturn(List.of());


        List<JobMatchResponse> responses =
                jobMatchService.getMyMatches(
                        "candidate@test.com"
                );


        assertNotNull(responses);

        assertTrue(
                responses.isEmpty()
        );


        verify(jobMatchRepository, never())
                .findByResume(any());
    }


    // =========================================================
    // GET MATCH BY ID
    // =========================================================

    @Test
    void getMatchById_ShouldThrowException_WhenCandidateNotFound() {

        when(userRepository.findByEmail(
                "candidate@test.com"
        )).thenReturn(Optional.empty());


        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> jobMatchService.getMatchById(
                                1000L,
                                "candidate@test.com"
                        )
                );


        assertEquals(
                "Candidate not found",
                exception.getMessage()
        );
    }


    @Test
    void getMatchById_ShouldThrowException_WhenMatchNotFound() {

        when(userRepository.findByEmail(
                "candidate@test.com"
        )).thenReturn(Optional.of(candidate));


        when(jobMatchRepository.findById(1000L))
                .thenReturn(Optional.empty());


        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> jobMatchService.getMatchById(
                                1000L,
                                "candidate@test.com"
                        )
                );


        assertEquals(
                "Job match not found",
                exception.getMessage()
        );
    }


    @Test
    void getMatchById_ShouldThrowException_WhenCandidateDoesNotOwnMatch() {

        User anotherCandidate =
                User.builder()
                        .id(2L)
                        .firstName("Other")
                        .lastName("User")
                        .email("other@test.com")
                        .build();


        Resume otherResume =
                Resume.builder()
                        .id(200L)
                        .candidate(anotherCandidate)
                        .extractedText("Java")
                        .build();


        JobMatch unauthorizedMatch =
                JobMatch.builder()
                        .id(2000L)
                        .resume(otherResume)
                        .job(job)
                        .matchScore(70)
                        .build();


        when(userRepository.findByEmail(
                "candidate@test.com"
        )).thenReturn(Optional.of(candidate));


        when(jobMatchRepository.findById(2000L))
                .thenReturn(Optional.of(
                        unauthorizedMatch
                ));


        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> jobMatchService.getMatchById(
                                2000L,
                                "candidate@test.com"
                        )
                );


        assertEquals(
                "You cannot access this job match.",
                exception.getMessage()
        );
    }


    @Test
    void getMatchById_ShouldReturnMatch_WhenCandidateOwnsMatch() {

        when(userRepository.findByEmail(
                "candidate@test.com"
        )).thenReturn(Optional.of(candidate));


        when(jobMatchRepository.findById(1000L))
                .thenReturn(Optional.of(jobMatch));


        JobMatchResponse response =
                jobMatchService.getMatchById(
                        1000L,
                        "candidate@test.com"
                );


        assertNotNull(response);


        assertEquals(
                1000L,
                response.getId()
        );


        assertEquals(
                100L,
                response.getResumeId()
        );


        assertEquals(
                10L,
                response.getJobId()
        );


        assertEquals(
                "Java Developer",
                response.getJobTitle()
        );


        assertEquals(
                "HireAI",
                response.getCompanyName()
        );


        assertEquals(
                85,
                response.getMatchScore()
        );


        assertEquals(
                "Java, Spring Boot, MySQL",
                response.getMatchingSkills()
        );


        assertEquals(
                "Docker",
                response.getMissingSkills()
        );


        assertEquals(
                "Highly Recommended",
                response.getRecommendation()
        );
    }
}