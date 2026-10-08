package com.hireai.resume.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hireai.application.repository.ApplicationRepository;
import com.hireai.resume.dto.response.ResumeAnalysisResponse;
import com.hireai.resume.dto.response.ResumeResponse;
import com.hireai.resume.entity.Resume;
import com.hireai.resume.repository.ResumeRepository;
import com.hireai.user.entity.User;
import com.hireai.user.enums.Role;
import com.hireai.user.repository.UserRepository;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class ResumeServiceImplTest {

    // =========================================================
    // RESUME SERVICE MOCKS
    // =========================================================

    @Mock
    private ResumeRepository resumeRepository;

    @Mock
    private UserRepository userRepository;

    /*
     * ResumeServiceImpl checks whether an HR is authorized
     * to access a candidate's resume by checking whether
     * that candidate has applied to one of the HR's jobs.
     */
    @Mock
    private ApplicationRepository applicationRepository;

    @InjectMocks
    private ResumeServiceImpl resumeService;

    // =========================================================
    // RESUME ANALYSIS SERVICE MOCKS
    // =========================================================

    @Mock
    private ChatClient.Builder chatClientBuilder;

    @Mock
    private ChatClient chatClient;

    @Mock
    private ChatClient.ChatClientRequestSpec chatRequestSpec;

    @Mock
    private ChatClient.CallResponseSpec callResponseSpec;

    @Mock
    private ObjectMapper objectMapper;

    private ResumeAnalysisServiceImpl resumeAnalysisService;

    // =========================================================
    // TEST DATA
    // =========================================================

    private User candidate;
    private User hr;
    private Resume resume;

    private final String candidateEmail =
            "candidate@gmail.com";

    private final String hrEmail =
            "hr@gmail.com";

    // =========================================================
    // SETUP
    // =========================================================

    @BeforeEach
    void setUp() throws Exception {

        MockitoAnnotations.openMocks(this);

        when(chatClientBuilder.build())
                .thenReturn(chatClient);

        resumeAnalysisService =
                new ResumeAnalysisServiceImpl(
                        resumeRepository,
                        userRepository,
                        chatClientBuilder,
                        objectMapper
                );

        candidate = User.builder()
                .id(1L)
                .firstName("Debashis")
                .lastName("Satapathy")
                .email(candidateEmail)
                .role(Role.CANDIDATE)
                .resumeUrl(null)
                .build();

        hr = User.builder()
                .id(2L)
                .firstName("HR")
                .lastName("User")
                .email(hrEmail)
                .role(Role.HR)
                .build();

        resume = Resume.builder()
                .id(10L)
                .candidate(candidate)
                .fileName("resume.pdf")
                .fileUrl("/uploads/resumes/resume.pdf")
                .contentType("application/pdf")
                .fileSize(1024L)
                .uploadedAt(LocalDateTime.now())
                .extractedText(
                        "Java developer with Spring Boot, " +
                                "MySQL and REST API experience."
                )
                .build();
    }

    // =========================================================
    // HELPER - CREATE A REAL TEXT-BASED PDF
    // =========================================================

    /**
     * Creates a real, valid PDF containing actual text.
     *
     * ResumeServiceImpl uses PDFBox to extract text from
     * uploaded resumes. Therefore the test PDF must contain
     * extractable text instead of being an empty PDF.
     */
    private byte[] createValidPdf() throws IOException {

        try (PDDocument document = new PDDocument();
             ByteArrayOutputStream outputStream =
                     new ByteArrayOutputStream()) {

            PDPage page = new PDPage();
            document.addPage(page);

            PDType1Font font =
                    new PDType1Font(
                            Standard14Fonts.FontName.HELVETICA
                    );

            try (PDPageContentStream contentStream =
                         new PDPageContentStream(document, page)) {

                contentStream.beginText();

                contentStream.setFont(font, 12);

                contentStream.newLineAtOffset(
                        50,
                        700
                );

                contentStream.showText(
                        "Debashis Satapathy - Java Developer"
                );

                contentStream.newLineAtOffset(
                        0,
                        -20
                );

                contentStream.showText(
                        "Java Spring Boot REST API MySQL React SQL"
                );

                contentStream.newLineAtOffset(
                        0,
                        -20
                );

                contentStream.showText(
                        "Software Developer with experience in backend development."
                );

                contentStream.endText();
            }

            document.save(outputStream);

            return outputStream.toByteArray();
        }
    }

    // =========================================================
    // CLEANUP
    // =========================================================

    @AfterEach
    void cleanUp() throws Exception {

        Path uploadPath =
                Path.of("uploads/resumes");

        if (Files.exists(uploadPath)) {

            try (var stream = Files.list(uploadPath)) {

                stream.forEach(path -> {

                    try {
                        Files.deleteIfExists(path);
                    } catch (IOException ignored) {
                        // Test cleanup should not fail the test.
                    }

                });
            }
        }
    }

    // =========================================================
    // UPLOAD RESUME
    // =========================================================

    @Test
    void uploadResume_ShouldThrowException_WhenFileIsNull() {

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> resumeService.uploadResume(
                                null,
                                candidateEmail
                        )
                );

        assertEquals(
                "Resume file is required.",
                exception.getMessage()
        );

        verifyNoInteractions(
                userRepository,
                resumeRepository,
                applicationRepository
        );
    }

    @Test
    void uploadResume_ShouldThrowException_WhenFileIsEmpty() {

        MockMultipartFile file =
                new MockMultipartFile(
                        "file",
                        "resume.pdf",
                        "application/pdf",
                        new byte[0]
                );

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> resumeService.uploadResume(
                                file,
                                candidateEmail
                        )
                );

        assertEquals(
                "Resume file is required.",
                exception.getMessage()
        );

        verifyNoInteractions(
                userRepository,
                resumeRepository,
                applicationRepository
        );
    }

    @Test
    void uploadResume_ShouldThrowException_WhenFileIsNotPdf() {

        MockMultipartFile file =
                new MockMultipartFile(
                        "file",
                        "resume.txt",
                        "text/plain",
                        "resume".getBytes()
                );

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> resumeService.uploadResume(
                                file,
                                candidateEmail
                        )
                );

        assertEquals(
                "Only PDF files are allowed.",
                exception.getMessage()
        );

        verifyNoInteractions(
                userRepository,
                resumeRepository,
                applicationRepository
        );
    }

    @Test
    void uploadResume_ShouldThrowException_WhenPdfExtensionIsMissing() {

        MockMultipartFile file =
                new MockMultipartFile(
                        "file",
                        "resume",
                        "application/pdf",
                        "PDF content".getBytes()
                );

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> resumeService.uploadResume(
                                file,
                                candidateEmail
                        )
                );

        assertEquals(
                "Resume file must have a .pdf extension.",
                exception.getMessage()
        );

        verifyNoInteractions(
                userRepository,
                resumeRepository,
                applicationRepository
        );
    }

    @Test
    void uploadResume_ShouldThrowException_WhenFileNameIsNull() {

        MockMultipartFile file =
                new MockMultipartFile(
                        "file",
                        null,
                        "application/pdf",
                        "PDF content".getBytes()
                );

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> resumeService.uploadResume(
                                file,
                                candidateEmail
                        )
                );

        assertEquals(
                "Resume file name is required.",
                exception.getMessage()
        );

        verifyNoInteractions(
                userRepository,
                resumeRepository,
                applicationRepository
        );
    }

    @Test
    void uploadResume_ShouldThrowException_WhenFileIsTooLarge() {

        byte[] content =
                new byte[(5 * 1024 * 1024) + 1];

        MockMultipartFile file =
                new MockMultipartFile(
                        "file",
                        "resume.pdf",
                        "application/pdf",
                        content
                );

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> resumeService.uploadResume(
                                file,
                                candidateEmail
                        )
                );

        assertEquals(
                "Resume file must not exceed 5 MB.",
                exception.getMessage()
        );

        verifyNoInteractions(
                userRepository,
                resumeRepository,
                applicationRepository
        );
    }

    @Test
    void uploadResume_ShouldThrowException_WhenCandidateNotFound()
            throws Exception {

        MockMultipartFile file =
                new MockMultipartFile(
                        "file",
                        "resume.pdf",
                        "application/pdf",
                        createValidPdf()
                );

        when(userRepository.findByEmail(candidateEmail))
                .thenReturn(Optional.empty());

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> resumeService.uploadResume(
                                file,
                                candidateEmail
                        )
                );

        assertEquals(
                "Candidate not found.",
                exception.getMessage()
        );

        verify(resumeRepository, never())
                .save(any(Resume.class));
    }

    @Test
    void uploadResume_ShouldThrowException_WhenUserIsNotCandidate()
            throws Exception {

        MockMultipartFile file =
                new MockMultipartFile(
                        "file",
                        "resume.pdf",
                        "application/pdf",
                        createValidPdf()
                );

        when(userRepository.findByEmail(hrEmail))
                .thenReturn(Optional.of(hr));

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> resumeService.uploadResume(
                                file,
                                hrEmail
                        )
                );

        assertEquals(
                "Only candidates can access resumes.",
                exception.getMessage()
        );

        verify(resumeRepository, never())
                .save(any(Resume.class));
    }

    @Test
    void uploadResume_ShouldSaveResumeSuccessfully()
            throws Exception {

        byte[] pdfBytes =
                createValidPdf();

        MockMultipartFile file =
                new MockMultipartFile(
                        "file",
                        "my-resume.pdf",
                        "application/pdf",
                        pdfBytes
                );

        when(userRepository.findByEmail(candidateEmail))
                .thenReturn(Optional.of(candidate));

        when(
                resumeRepository
                        .findTopByCandidateOrderByUploadedAtDesc(
                                candidate
                        )
        ).thenReturn(Optional.empty());

        when(resumeRepository.save(any(Resume.class)))
                .thenAnswer(invocation -> {

                    Resume saved =
                            invocation.getArgument(0);

                    saved.setId(100L);

                    if (saved.getUploadedAt() == null) {
                        saved.setUploadedAt(
                                LocalDateTime.now()
                        );
                    }

                    return saved;
                });

        ResumeResponse response =
                resumeService.uploadResume(
                        file,
                        candidateEmail
                );

        assertNotNull(response);

        assertEquals(
                100L,
                response.getId()
        );

        assertEquals(
                "my-resume.pdf",
                response.getFileName()
        );

        assertEquals(
                "application/pdf",
                response.getContentType()
        );

        assertEquals(
                pdfBytes.length,
                response.getFileSize()
        );

        assertNotNull(
                response.getFileUrl()
        );

        assertTrue(
                response.getFileUrl()
                        .startsWith("/uploads/resumes/")
        );

        assertTrue(
                response.getFileUrl()
                        .endsWith("_resume.pdf")
        );

        assertEquals(
                response.getFileUrl(),
                candidate.getResumeUrl()
        );

        verify(resumeRepository)
                .save(any(Resume.class));

        verify(userRepository)
                .save(candidate);
    }

    @Test
    void uploadResume_ShouldSanitizeOriginalFileName()
            throws Exception {

        byte[] pdfBytes =
                createValidPdf();

        MockMultipartFile file =
                new MockMultipartFile(
                        "file",
                        "../my-resume.pdf",
                        "application/pdf",
                        pdfBytes
                );

        when(userRepository.findByEmail(candidateEmail))
                .thenReturn(Optional.of(candidate));

        when(
                resumeRepository
                        .findTopByCandidateOrderByUploadedAtDesc(
                                candidate
                        )
        ).thenReturn(Optional.empty());

        when(resumeRepository.save(any(Resume.class)))
                .thenAnswer(invocation -> {

                    Resume saved =
                            invocation.getArgument(0);

                    saved.setId(102L);

                    saved.setUploadedAt(
                            LocalDateTime.now()
                    );

                    return saved;
                });

        ResumeResponse response =
                resumeService.uploadResume(
                        file,
                        candidateEmail
                );

        assertNotNull(response);

        assertEquals(
                "my-resume.pdf",
                response.getFileName()
        );

        assertTrue(
                response.getFileUrl()
                        .startsWith("/uploads/resumes/")
        );

        verify(resumeRepository)
                .save(any(Resume.class));
    }

    @Test
    void uploadResume_ShouldDeleteOldResume_WhenPreviousResumeExists()
            throws Exception {

        Path uploadPath =
                Path.of("uploads/resumes");

        Files.createDirectories(uploadPath);

        Path oldFile =
                uploadPath.resolve("old-resume.pdf");

        Files.write(
                oldFile,
                "old pdf".getBytes()
        );

        Resume oldResume =
                Resume.builder()
                        .id(20L)
                        .candidate(candidate)
                        .fileName("old-resume.pdf")
                        .fileUrl(
                                "/uploads/resumes/old-resume.pdf"
                        )
                        .contentType("application/pdf")
                        .fileSize(100L)
                        .uploadedAt(
                                LocalDateTime.now()
                                        .minusDays(1)
                        )
                        .build();

        byte[] pdfBytes =
                createValidPdf();

        MockMultipartFile file =
                new MockMultipartFile(
                        "file",
                        "new-resume.pdf",
                        "application/pdf",
                        pdfBytes
                );

        when(userRepository.findByEmail(candidateEmail))
                .thenReturn(Optional.of(candidate));

        when(
                resumeRepository
                        .findTopByCandidateOrderByUploadedAtDesc(
                                candidate
                        )
        ).thenReturn(Optional.of(oldResume));

        when(resumeRepository.save(any(Resume.class)))
                .thenAnswer(invocation -> {

                    Resume saved =
                            invocation.getArgument(0);

                    saved.setId(21L);

                    saved.setUploadedAt(
                            LocalDateTime.now()
                    );

                    return saved;
                });

        ResumeResponse response =
                resumeService.uploadResume(
                        file,
                        candidateEmail
                );

        assertNotNull(response);

        assertFalse(
                Files.exists(oldFile)
        );

        verify(resumeRepository)
                .delete(oldResume);
    }

    // =========================================================
    // GET MY RESUMES
    // =========================================================

    @Test
    void getMyResumes_ShouldReturnCandidateResumes() {

        when(userRepository.findByEmail(candidateEmail))
                .thenReturn(Optional.of(candidate));

        when(resumeRepository.findByCandidate(candidate))
                .thenReturn(List.of(resume));

        List<ResumeResponse> responses =
                resumeService.getMyResumes(
                        candidateEmail
                );

        assertNotNull(responses);

        assertEquals(
                1,
                responses.size()
        );

        assertEquals(
                10L,
                responses.get(0).getId()
        );

        assertEquals(
                "resume.pdf",
                responses.get(0).getFileName()
        );

        verify(resumeRepository)
                .findByCandidate(candidate);
    }

    @Test
    void getMyResumes_ShouldThrowException_WhenUserNotFound() {

        when(userRepository.findByEmail(candidateEmail))
                .thenReturn(Optional.empty());

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> resumeService.getMyResumes(
                                candidateEmail
                        )
                );

        assertEquals(
                "Candidate not found.",
                exception.getMessage()
        );

        verifyNoInteractions(resumeRepository);
    }

    @Test
    void getMyResumes_ShouldThrowException_WhenUserIsNotCandidate() {

        when(userRepository.findByEmail(hrEmail))
                .thenReturn(Optional.of(hr));

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> resumeService.getMyResumes(
                                hrEmail
                        )
                );

        assertEquals(
                "Only candidates can access resumes.",
                exception.getMessage()
        );

        verifyNoInteractions(resumeRepository);
    }

    // =========================================================
    // GET RESUME BY ID
    // =========================================================

    @Test
    void getResumeById_ShouldReturnResume_WhenOwnerRequestsIt() {

        when(userRepository.findByEmail(candidateEmail))
                .thenReturn(Optional.of(candidate));

        when(
                resumeRepository.findByIdAndCandidate(
                        10L,
                        candidate
                )
        ).thenReturn(Optional.of(resume));

        ResumeResponse response =
                resumeService.getResumeById(
                        10L,
                        candidateEmail
                );

        assertNotNull(response);

        assertEquals(
                10L,
                response.getId()
        );

        assertEquals(
                "resume.pdf",
                response.getFileName()
        );

        verify(resumeRepository)
                .findByIdAndCandidate(
                        10L,
                        candidate
                );
    }

    @Test
    void getResumeById_ShouldThrowException_WhenResumeNotFound() {

        when(userRepository.findByEmail(candidateEmail))
                .thenReturn(Optional.of(candidate));

        when(
                resumeRepository.findByIdAndCandidate(
                        999L,
                        candidate
                )
        ).thenReturn(Optional.empty());

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> resumeService.getResumeById(
                                999L,
                                candidateEmail
                        )
                );

        assertEquals(
                "Resume not found.",
                exception.getMessage()
        );
    }

    @Test
    void getResumeById_ShouldThrowException_WhenIdIsInvalid() {

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> resumeService.getResumeById(
                                0L,
                                candidateEmail
                        )
                );

        assertEquals(
                "Resume ID must be greater than 0.",
                exception.getMessage()
        );

        verifyNoInteractions(
                userRepository,
                resumeRepository
        );
    }

    @Test
    void getResumeById_ShouldNotExposeAnotherUsersResume() {

        when(userRepository.findByEmail(candidateEmail))
                .thenReturn(Optional.of(candidate));

        when(
                resumeRepository.findByIdAndCandidate(
                        10L,
                        candidate
                )
        ).thenReturn(Optional.empty());

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> resumeService.getResumeById(
                                10L,
                                candidateEmail
                        )
                );

        assertEquals(
                "Resume not found.",
                exception.getMessage()
        );
    }

    // =========================================================
    // DELETE RESUME
    // =========================================================

    @Test
    void deleteResume_ShouldDeleteResumeSuccessfully()
            throws Exception {

        Path uploadPath =
                Path.of("uploads/resumes");

        Files.createDirectories(uploadPath);

        Path filePath =
                uploadPath.resolve("resume.pdf");

        Files.write(
                filePath,
                "pdf".getBytes()
        );

        when(userRepository.findByEmail(candidateEmail))
                .thenReturn(Optional.of(candidate));

        when(
                resumeRepository.findByIdAndCandidate(
                        10L,
                        candidate
                )
        ).thenReturn(Optional.of(resume));

        candidate.setResumeUrl(
                "/uploads/resumes/resume.pdf"
        );

        resumeService.deleteResume(
                10L,
                candidateEmail
        );

        assertFalse(
                Files.exists(filePath)
        );

        assertNull(
                candidate.getResumeUrl()
        );

        verify(resumeRepository)
                .delete(resume);

        verify(userRepository)
                .save(candidate);
    }

    @Test
    void deleteResume_ShouldThrowException_WhenResumeNotFound() {

        when(userRepository.findByEmail(candidateEmail))
                .thenReturn(Optional.of(candidate));

        when(
                resumeRepository.findByIdAndCandidate(
                        999L,
                        candidate
                )
        ).thenReturn(Optional.empty());

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> resumeService.deleteResume(
                                999L,
                                candidateEmail
                        )
                );

        assertEquals(
                "Resume not found.",
                exception.getMessage()
        );
    }

    @Test
    void deleteResume_ShouldNotDeleteAnotherUsersResume() {

        when(userRepository.findByEmail(candidateEmail))
                .thenReturn(Optional.of(candidate));

        when(
                resumeRepository.findByIdAndCandidate(
                        10L,
                        candidate
                )
        ).thenReturn(Optional.empty());

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> resumeService.deleteResume(
                                10L,
                                candidateEmail
                        )
                );

        assertEquals(
                "Resume not found.",
                exception.getMessage()
        );

        verify(
                resumeRepository,
                never()
        ).delete(any());
    }

    @Test
    void deleteResume_ShouldThrowException_WhenIdIsInvalid() {

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> resumeService.deleteResume(
                                0L,
                                candidateEmail
                        )
                );

        assertEquals(
                "Resume ID must be greater than 0.",
                exception.getMessage()
        );

        verifyNoInteractions(
                userRepository,
                resumeRepository
        );
    }

    // =========================================================
    // HR - GET CANDIDATE RESUME
    // =========================================================

    @Test
    void getCandidateResume_ShouldReturnResume_WhenHRRequestsIt() {

        when(userRepository.findByEmail(hrEmail))
                .thenReturn(Optional.of(hr));

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(candidate));

        when(
                applicationRepository
                        .existsByCandidateAndJob_Hr(
                                candidate,
                                hr
                        )
        ).thenReturn(true);

        when(
                resumeRepository
                        .findTopByCandidateOrderByUploadedAtDesc(
                                candidate
                        )
        ).thenReturn(Optional.of(resume));

        ResumeResponse response =
                resumeService.getCandidateResume(
                        1L,
                        hrEmail
                );

        assertNotNull(response);

        assertEquals(
                10L,
                response.getId()
        );

        assertEquals(
                candidateEmail,
                response.getCandidateEmail()
        );

        assertEquals(
                "Debashis Satapathy",
                response.getCandidateName()
        );

        verify(
                applicationRepository
        ).existsByCandidateAndJob_Hr(
                candidate,
                hr
        );

        verify(
                resumeRepository
        ).findTopByCandidateOrderByUploadedAtDesc(
                candidate
        );
    }

    @Test
    void getCandidateResume_ShouldThrowException_WhenUserIsNotHR() {

        when(userRepository.findByEmail(candidateEmail))
                .thenReturn(Optional.of(candidate));

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> resumeService.getCandidateResume(
                                1L,
                                candidateEmail
                        )
                );

        assertEquals(
                "Only HR can access candidate resumes.",
                exception.getMessage()
        );

        verifyNoInteractions(
                resumeRepository,
                applicationRepository
        );
    }

    @Test
    void getCandidateResume_ShouldThrowException_WhenHRNotFound() {

        when(userRepository.findByEmail(hrEmail))
                .thenReturn(Optional.empty());

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> resumeService.getCandidateResume(
                                1L,
                                hrEmail
                        )
                );

        assertEquals(
                "HR not found.",
                exception.getMessage()
        );

        verifyNoInteractions(
                resumeRepository,
                applicationRepository
        );
    }

    @Test
    void getCandidateResume_ShouldThrowException_WhenCandidateNotFound() {

        when(userRepository.findByEmail(hrEmail))
                .thenReturn(Optional.of(hr));

        when(userRepository.findById(999L))
                .thenReturn(Optional.empty());

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> resumeService.getCandidateResume(
                                999L,
                                hrEmail
                        )
                );

        assertEquals(
                "Candidate not found.",
                exception.getMessage()
        );

        verifyNoInteractions(
                applicationRepository,
                resumeRepository
        );
    }

    @Test
    void getCandidateResume_ShouldThrowException_WhenUserIsNotCandidate() {

        User admin =
                User.builder()
                        .id(3L)
                        .email("admin@gmail.com")
                        .role(Role.ADMIN)
                        .build();

        when(userRepository.findByEmail(hrEmail))
                .thenReturn(Optional.of(hr));

        when(userRepository.findById(3L))
                .thenReturn(Optional.of(admin));

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> resumeService.getCandidateResume(
                                3L,
                                hrEmail
                        )
                );

        assertEquals(
                "The specified user is not a candidate.",
                exception.getMessage()
        );

        verifyNoInteractions(
                applicationRepository,
                resumeRepository
        );
    }

    @Test
    void getCandidateResume_ShouldThrowException_WhenCandidateHasNoResume() {

        when(userRepository.findByEmail(hrEmail))
                .thenReturn(Optional.of(hr));

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(candidate));

        when(
                applicationRepository
                        .existsByCandidateAndJob_Hr(
                                candidate,
                                hr
                        )
        ).thenReturn(true);

        when(
                resumeRepository
                        .findTopByCandidateOrderByUploadedAtDesc(
                                candidate
                        )
        ).thenReturn(Optional.empty());

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> resumeService.getCandidateResume(
                                1L,
                                hrEmail
                        )
                );

        assertEquals(
                "Candidate has not uploaded a resume.",
                exception.getMessage()
        );
    }

    // =========================================================
    // HR - DOWNLOAD RESUME
    // =========================================================

    @Test
    void downloadCandidateResume_ShouldThrowException_WhenUserIsNotHR() {

        when(userRepository.findByEmail(candidateEmail))
                .thenReturn(Optional.of(candidate));

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> resumeService.downloadCandidateResume(
                                1L,
                                candidateEmail
                        )
                );

        assertEquals(
                "Only HR can access candidate resumes.",
                exception.getMessage()
        );

        verifyNoInteractions(
                applicationRepository
        );
    }

    @Test
    void downloadCandidateResume_ShouldReturnPdfResource()
            throws Exception {

        Path uploadPath =
                Path.of("uploads/resumes");

        Files.createDirectories(uploadPath);

        Path filePath =
                uploadPath.resolve("resume.pdf");

        Files.write(
                filePath,
                "pdf content".getBytes()
        );

        when(userRepository.findByEmail(hrEmail))
                .thenReturn(Optional.of(hr));

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(candidate));

        when(
                applicationRepository
                        .existsByCandidateAndJob_Hr(
                                candidate,
                                hr
                        )
        ).thenReturn(true);

        when(
                resumeRepository
                        .findTopByCandidateOrderByUploadedAtDesc(
                                candidate
                        )
        ).thenReturn(Optional.of(resume));

        ResponseEntity<Resource> response =
                resumeService.downloadCandidateResume(
                        1L,
                        hrEmail
                );

        assertNotNull(response);

        assertEquals(
                200,
                response.getStatusCode().value()
        );

        assertNotNull(
                response.getBody()
        );

        assertEquals(
                "application/pdf",
                response.getHeaders()
                        .getContentType()
                        .toString()
        );

        String disposition =
                response.getHeaders()
                        .getFirst(
                                HttpHeaders.CONTENT_DISPOSITION
                        );

        assertNotNull(disposition);

        assertTrue(
                disposition.contains("attachment")
        );

        assertTrue(
                disposition.contains("resume.pdf")
        );

        verify(
                applicationRepository
        ).existsByCandidateAndJob_Hr(
                candidate,
                hr
        );
    }

    @Test
    void downloadCandidateResume_ShouldThrowException_WhenCandidateHasNoResume() {

        when(userRepository.findByEmail(hrEmail))
                .thenReturn(Optional.of(hr));

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(candidate));

        when(
                applicationRepository
                        .existsByCandidateAndJob_Hr(
                                candidate,
                                hr
                        )
        ).thenReturn(true);

        when(
                resumeRepository
                        .findTopByCandidateOrderByUploadedAtDesc(
                                candidate
                        )
        ).thenReturn(Optional.empty());

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> resumeService.downloadCandidateResume(
                                1L,
                                hrEmail
                        )
                );

        assertEquals(
                "Candidate has not uploaded a resume.",
                exception.getMessage()
        );
    }

    // =========================================================
    // VIEW RESUME
    // =========================================================

    @Test
    void viewResume_ShouldReturnPdfResource()
            throws Exception {

        Path uploadPath =
                Path.of("uploads/resumes");

        Files.createDirectories(uploadPath);

        Path filePath =
                uploadPath.resolve("resume.pdf");

        Files.write(
                filePath,
                "pdf content".getBytes()
        );

        when(userRepository.findByEmail(candidateEmail))
                .thenReturn(Optional.of(candidate));

        when(
                resumeRepository.findByIdAndCandidate(
                        10L,
                        candidate
                )
        ).thenReturn(Optional.of(resume));

        ResponseEntity<Resource> response =
                resumeService.viewResume(
                        10L,
                        candidateEmail
                );

        assertNotNull(response);

        assertEquals(
                200,
                response.getStatusCode().value()
        );

        assertNotNull(
                response.getBody()
        );

        assertEquals(
                "application/pdf",
                response.getHeaders()
                        .getContentType()
                        .toString()
        );

        String disposition =
                response.getHeaders()
                        .getFirst(
                                HttpHeaders.CONTENT_DISPOSITION
                        );

        assertNotNull(disposition);

        assertTrue(
                disposition.contains("inline")
        );

        assertTrue(
                disposition.contains("resume.pdf")
        );
    }

    @Test
    void viewResume_ShouldThrowException_WhenResumeNotFound() {

        when(userRepository.findByEmail(candidateEmail))
                .thenReturn(Optional.of(candidate));

        when(
                resumeRepository.findByIdAndCandidate(
                        999L,
                        candidate
                )
        ).thenReturn(Optional.empty());

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> resumeService.viewResume(
                                999L,
                                candidateEmail
                        )
                );

        assertEquals(
                "Resume not found.",
                exception.getMessage()
        );
    }

    @Test
    void viewResume_ShouldNotExposeAnotherUsersResume() {

        when(userRepository.findByEmail(candidateEmail))
                .thenReturn(Optional.of(candidate));

        when(
                resumeRepository.findByIdAndCandidate(
                        10L,
                        candidate
                )
        ).thenReturn(Optional.empty());

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> resumeService.viewResume(
                                10L,
                                candidateEmail
                        )
                );

        assertEquals(
                "Resume not found.",
                exception.getMessage()
        );
    }

    // =========================================================
    // AI RESUME ANALYSIS
    // =========================================================

    @Test
    void analyzeResume_ShouldReturnAnalysisSuccessfully()
            throws Exception {

        String aiJson = """
                {
                  "overallScore": 85,
                  "summary": "Strong Java backend candidate",
                  "skills": "Java, Spring Boot, MySQL, REST API",
                  "strengths": "Strong backend development skills",
                  "weaknesses": "Limited professional experience",
                  "missingSkills": "Docker, AWS",
                  "recommendedRoles": "Java Developer, Backend Developer",
                  "experienceLevel": "Entry-Level / Fresher"
                }
                """;

        when(userRepository.findByEmail(candidateEmail))
                .thenReturn(Optional.of(candidate));

        when(
                resumeRepository.findByIdAndCandidate(
                        10L,
                        candidate
                )
        ).thenReturn(Optional.of(resume));

        when(chatClient.prompt())
                .thenReturn(chatRequestSpec);

        when(
                chatRequestSpec.user(any(String.class))
        ).thenReturn(chatRequestSpec);

        when(chatRequestSpec.call())
                .thenReturn(callResponseSpec);

        when(callResponseSpec.content())
                .thenReturn(aiJson);

        ResumeAnalysisResponse expectedResponse =
                ResumeAnalysisResponse.builder()
                        .resumeId(10L)
                        .overallScore(85)
                        .summary(
                                "Strong Java backend candidate"
                        )
                        .skills(
                                "Java, Spring Boot, MySQL, REST API"
                        )
                        .strengths(
                                "Strong backend development skills"
                        )
                        .weaknesses(
                                "Limited professional experience"
                        )
                        .missingSkills(
                                "Docker, AWS"
                        )
                        .recommendedRoles(
                                "Java Developer, Backend Developer"
                        )
                        .experienceLevel(
                                "Entry-Level / Fresher"
                        )
                        .build();

        when(
                objectMapper.readValue(
                        any(String.class),
                        eq(ResumeAnalysisResponse.class)
                )
        ).thenReturn(expectedResponse);

        ResumeAnalysisResponse response =
                resumeAnalysisService.analyzeResume(
                        10L,
                        candidateEmail
                );

        assertNotNull(response);

        assertEquals(
                10L,
                response.getResumeId()
        );

        assertEquals(
                85,
                response.getOverallScore()
        );

        assertEquals(
                "Strong Java backend candidate",
                response.getSummary()
        );

        assertEquals(
                "Java, Spring Boot, MySQL, REST API",
                response.getSkills()
        );

        assertEquals(
                "Strong backend development skills",
                response.getStrengths()
        );

        assertEquals(
                "Limited professional experience",
                response.getWeaknesses()
        );

        assertEquals(
                "Docker, AWS",
                response.getMissingSkills()
        );

        assertEquals(
                "Java Developer, Backend Developer",
                response.getRecommendedRoles()
        );

        assertEquals(
                "Entry-Level / Fresher",
                response.getExperienceLevel()
        );

        verify(userRepository)
                .findByEmail(candidateEmail);

        verify(resumeRepository)
                .findByIdAndCandidate(
                        10L,
                        candidate
                );

        verify(chatClient)
                .prompt();

        verify(chatRequestSpec)
                .user(any(String.class));

        verify(chatRequestSpec)
                .call();

        verify(callResponseSpec)
                .content();

        verify(objectMapper)
                .readValue(
                        any(String.class),
                        eq(ResumeAnalysisResponse.class)
                );
    }

    @Test
    void analyzeResume_ShouldThrowException_WhenCandidateNotFound() {

        when(userRepository.findByEmail(candidateEmail))
                .thenReturn(Optional.empty());

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> resumeAnalysisService.analyzeResume(
                                10L,
                                candidateEmail
                        )
                );

        assertEquals(
                "Candidate not found",
                exception.getMessage()
        );

        verifyNoInteractions(
                resumeRepository,
                chatClient,
                objectMapper
        );
    }

    @Test
    void analyzeResume_ShouldThrowException_WhenResumeNotFound() {

        when(userRepository.findByEmail(candidateEmail))
                .thenReturn(Optional.of(candidate));

        when(
                resumeRepository.findByIdAndCandidate(
                        999L,
                        candidate
                )
        ).thenReturn(Optional.empty());

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> resumeAnalysisService.analyzeResume(
                                999L,
                                candidateEmail
                        )
                );

        assertEquals(
                "Resume not found",
                exception.getMessage()
        );

        verifyNoInteractions(
                chatClient,
                objectMapper
        );
    }

    @Test
    void analyzeResume_ShouldThrowException_WhenExtractedTextIsNull() {

        resume.setExtractedText(null);

        when(userRepository.findByEmail(candidateEmail))
                .thenReturn(Optional.of(candidate));

        when(
                resumeRepository.findByIdAndCandidate(
                        10L,
                        candidate
                )
        ).thenReturn(Optional.of(resume));

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> resumeAnalysisService.analyzeResume(
                                10L,
                                candidateEmail
                        )
                );

        assertEquals(
                "No extracted text found in resume.",
                exception.getMessage()
        );

        verifyNoInteractions(
                chatClient,
                objectMapper
        );
    }

    @Test
    void analyzeResume_ShouldThrowException_WhenExtractedTextIsBlank() {

        resume.setExtractedText("   ");

        when(userRepository.findByEmail(candidateEmail))
                .thenReturn(Optional.of(candidate));

        when(
                resumeRepository.findByIdAndCandidate(
                        10L,
                        candidate
                )
        ).thenReturn(Optional.of(resume));

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> resumeAnalysisService.analyzeResume(
                                10L,
                                candidateEmail
                        )
                );

        assertEquals(
                "No extracted text found in resume.",
                exception.getMessage()
        );

        verifyNoInteractions(
                chatClient,
                objectMapper
        );
    }

    @Test
    void analyzeResume_ShouldThrowException_WhenAIResponseIsEmpty() {

        when(userRepository.findByEmail(candidateEmail))
                .thenReturn(Optional.of(candidate));

        when(
                resumeRepository.findByIdAndCandidate(
                        10L,
                        candidate
                )
        ).thenReturn(Optional.of(resume));

        when(chatClient.prompt())
                .thenReturn(chatRequestSpec);

        when(
                chatRequestSpec.user(any(String.class))
        ).thenReturn(chatRequestSpec);

        when(chatRequestSpec.call())
                .thenReturn(callResponseSpec);

        when(callResponseSpec.content())
                .thenReturn("");

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> resumeAnalysisService.analyzeResume(
                                10L,
                                candidateEmail
                        )
                );

        assertEquals(
                "AI returned an empty response.",
                exception.getMessage()
        );

        verify(chatClient)
                .prompt();

        verify(callResponseSpec)
                .content();
    }

    @Test
    void analyzeResume_ShouldParseMarkdownJsonResponse()
            throws Exception {

        String markdownResponse = """
                ```json
                {
                  "overallScore": 78,
                  "summary": "Good Java candidate",
                  "skills": "Java, Spring Boot",
                  "strengths": "Good backend knowledge",
                  "weaknesses": "Limited cloud experience",
                  "missingSkills": "AWS, Docker",
                  "recommendedRoles": "Java Developer",
                  "experienceLevel": "Entry-Level / Fresher"
                }
                ```
                """;

        when(userRepository.findByEmail(candidateEmail))
                .thenReturn(Optional.of(candidate));

        when(
                resumeRepository.findByIdAndCandidate(
                        10L,
                        candidate
                )
        ).thenReturn(Optional.of(resume));

        when(chatClient.prompt())
                .thenReturn(chatRequestSpec);

        when(
                chatRequestSpec.user(any(String.class))
        ).thenReturn(chatRequestSpec);

        when(chatRequestSpec.call())
                .thenReturn(callResponseSpec);

        when(callResponseSpec.content())
                .thenReturn(markdownResponse);

        ResumeAnalysisResponse expected =
                ResumeAnalysisResponse.builder()
                        .resumeId(10L)
                        .overallScore(78)
                        .summary(
                                "Good Java candidate"
                        )
                        .skills(
                                "Java, Spring Boot"
                        )
                        .strengths(
                                "Good backend knowledge"
                        )
                        .weaknesses(
                                "Limited cloud experience"
                        )
                        .missingSkills(
                                "AWS, Docker"
                        )
                        .recommendedRoles(
                                "Java Developer"
                        )
                        .experienceLevel(
                                "Entry-Level / Fresher"
                        )
                        .build();

        when(
                objectMapper.readValue(
                        any(String.class),
                        eq(ResumeAnalysisResponse.class)
                )
        ).thenReturn(expected);

        ResumeAnalysisResponse response =
                resumeAnalysisService.analyzeResume(
                        10L,
                        candidateEmail
                );

        assertNotNull(response);

        assertEquals(
                10L,
                response.getResumeId()
        );

        assertEquals(
                78,
                response.getOverallScore()
        );

        assertEquals(
                "Good Java candidate",
                response.getSummary()
        );

        assertEquals(
                "Java, Spring Boot",
                response.getSkills()
        );

        assertEquals(
                "Good backend knowledge",
                response.getStrengths()
        );

        assertEquals(
                "Limited cloud experience",
                response.getWeaknesses()
        );

        assertEquals(
                "AWS, Docker",
                response.getMissingSkills()
        );

        assertEquals(
                "Java Developer",
                response.getRecommendedRoles()
        );

        assertEquals(
                "Entry-Level / Fresher",
                response.getExperienceLevel()
        );

        verify(chatClient)
                .prompt();

        verify(chatRequestSpec)
                .user(any(String.class));

        verify(chatRequestSpec)
                .call();

        verify(callResponseSpec)
                .content();

        verify(objectMapper)
                .readValue(
                        any(String.class),
                        eq(ResumeAnalysisResponse.class)
                );
    }

    @Test
    void analyzeResume_ShouldThrowException_WhenAIResponseIsInvalidJson()
            throws Exception {

        String invalidJson =
                "{ invalid json response }";

        when(userRepository.findByEmail(candidateEmail))
                .thenReturn(Optional.of(candidate));

        when(
                resumeRepository.findByIdAndCandidate(
                        10L,
                        candidate
                )
        ).thenReturn(Optional.of(resume));

        when(chatClient.prompt())
                .thenReturn(chatRequestSpec);

        when(
                chatRequestSpec.user(any(String.class))
        ).thenReturn(chatRequestSpec);

        when(chatRequestSpec.call())
                .thenReturn(callResponseSpec);

        when(callResponseSpec.content())
                .thenReturn(invalidJson);

        when(
                objectMapper.readValue(
                        any(String.class),
                        eq(ResumeAnalysisResponse.class)
                )
        ).thenThrow(
                new RuntimeException("Invalid JSON")
        );

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> resumeAnalysisService.analyzeResume(
                                10L,
                                candidateEmail
                        )
                );

        assertEquals(
                "Failed to parse AI resume analysis response.",
                exception.getMessage()
        );

        verify(chatClient)
                .prompt();

        verify(chatRequestSpec)
                .user(any(String.class));

        verify(chatRequestSpec)
                .call();

        verify(callResponseSpec)
                .content();

        verify(objectMapper)
                .readValue(
                        any(String.class),
                        eq(ResumeAnalysisResponse.class)
                );
    }
}