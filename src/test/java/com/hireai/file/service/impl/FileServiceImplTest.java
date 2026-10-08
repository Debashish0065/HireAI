package com.hireai.file.service.impl;

import com.hireai.file.service.PdfTextExtractionService;
import com.hireai.resume.entity.Resume;
import com.hireai.resume.repository.ResumeRepository;
import com.hireai.user.entity.User;
import com.hireai.user.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class FileServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ResumeRepository resumeRepository;

    @Mock
    private PdfTextExtractionService pdfTextExtractionService;

    @InjectMocks
    private FileServiceImpl fileService;

    @TempDir
    Path tempDir;

    private User user;

    @BeforeEach
    void setUp() {

        MockitoAnnotations.openMocks(this);

        user = User.builder()
                .id(1L)
                .firstName("Test")
                .lastName("User")
                .email("test@gmail.com")
                .build();

        when(userRepository.findByEmail("test@gmail.com"))
                .thenReturn(Optional.of(user));
    }


    // =========================================================
    // UPLOAD RESUME - SUCCESS
    // =========================================================

    @Test
    void uploadResume_ShouldUploadPdfSuccessfully() throws Exception {

        MockMultipartFile file =
                new MockMultipartFile(
                        "file",
                        "resume.pdf",
                        "application/pdf",
                        "Test Resume Content".getBytes()
                );

        when(pdfTextExtractionService.extractText(any(Path.class)))
                .thenReturn("Extracted resume text");

        when(resumeRepository
                .findTopByCandidateOrderByUploadedAtDesc(user))
                .thenReturn(Optional.empty());

        String result =
                fileService.uploadResume(
                        file,
                        "test@gmail.com"
                );

        assertNotNull(result);
        assertTrue(result.endsWith("_resume.pdf"));

        assertEquals(
                result,
                user.getResumeUrl()
        );

        verify(userRepository).save(user);

        verify(resumeRepository).save(any(Resume.class));

        verify(pdfTextExtractionService)
                .extractText(any(Path.class));
    }


    // =========================================================
    // UPLOAD - NULL FILE
    // =========================================================

    @Test
    void uploadResume_ShouldThrowException_WhenFileIsNull() {

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> fileService.uploadResume(
                                null,
                                "test@gmail.com"
                        )
                );

        assertEquals(
                "Please select a resume file.",
                exception.getMessage()
        );

        verify(userRepository, never()).save(any());
    }


    // =========================================================
    // UPLOAD - EMPTY FILE
    // =========================================================

    @Test
    void uploadResume_ShouldThrowException_WhenFileIsEmpty() {

        MockMultipartFile file =
                new MockMultipartFile(
                        "file",
                        "resume.pdf",
                        "application/pdf",
                        new byte[0]
                );

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> fileService.uploadResume(
                                file,
                                "test@gmail.com"
                        )
                );

        assertEquals(
                "Please select a resume file.",
                exception.getMessage()
        );
    }


    // =========================================================
    // UPLOAD - NON PDF
    // =========================================================

    @Test
    void uploadResume_ShouldRejectNonPdfFile() {

        MockMultipartFile file =
                new MockMultipartFile(
                        "file",
                        "resume.docx",
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                        "Resume".getBytes()
                );

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> fileService.uploadResume(
                                file,
                                "test@gmail.com"
                        )
                );

        assertEquals(
                "Only PDF files are allowed.",
                exception.getMessage()
        );

        verify(userRepository, never()).save(any());
    }


    // =========================================================
    // UPLOAD - USER NOT FOUND
    // =========================================================

    @Test
    void uploadResume_ShouldThrowException_WhenUserNotFound() {

        when(userRepository.findByEmail("unknown@gmail.com"))
                .thenReturn(Optional.empty());

        MockMultipartFile file =
                new MockMultipartFile(
                        "file",
                        "resume.pdf",
                        "application/pdf",
                        "Resume".getBytes()
                );

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> fileService.uploadResume(
                                file,
                                "unknown@gmail.com"
                        )
                );

        assertEquals(
                "User not found",
                exception.getMessage()
        );
    }


    // =========================================================
    // DOWNLOAD - SUCCESS
    // =========================================================

    @Test
    void downloadResume_ShouldReturnResource_WhenResumeExists()
            throws Exception {

        Path uploadPath =
                Path.of(
                        System.getProperty("user.dir"),
                        "uploads",
                        "resumes"
                );

        Files.createDirectories(uploadPath);

        Path resumePath =
                uploadPath.resolve("test-resume.pdf");

        Files.write(
                resumePath,
                "Test Resume".getBytes()
        );

        user.setResumeUrl("test-resume.pdf");

        Resource resource =
                fileService.downloadResume(
                        "test@gmail.com"
                );

        assertNotNull(resource);
        assertTrue(resource.exists());
        assertTrue(resource.isReadable());

        Files.deleteIfExists(resumePath);
    }


    // =========================================================
    // DOWNLOAD - NO RESUME
    // =========================================================

    @Test
    void downloadResume_ShouldThrowException_WhenNoResumeExists() {

        user.setResumeUrl(null);

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> fileService.downloadResume(
                                "test@gmail.com"
                        )
                );

        assertEquals(
                "No resume found for this candidate.",
                exception.getMessage()
        );
    }


    // =========================================================
    // DOWNLOAD - FILE NOT FOUND
    // =========================================================

    @Test
    void downloadResume_ShouldThrowException_WhenFileDoesNotExist() {

        user.setResumeUrl("missing-resume.pdf");

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> fileService.downloadResume(
                                "test@gmail.com"
                        )
                );

        assertEquals(
                "Resume file not found.",
                exception.getMessage()
        );
    }


    // =========================================================
    // VIEW RESUME
    // =========================================================

    @Test
    void viewResume_ShouldReturnSameResourceAsDownload()
            throws Exception {

        Path uploadPath =
                Path.of(
                        System.getProperty("user.dir"),
                        "uploads",
                        "resumes"
                );

        Files.createDirectories(uploadPath);

        Path resumePath =
                uploadPath.resolve("view-resume.pdf");

        Files.write(
                resumePath,
                "View Resume".getBytes()
        );

        user.setResumeUrl("view-resume.pdf");

        Resource resource =
                fileService.viewResume(
                        "test@gmail.com"
                );

        assertNotNull(resource);
        assertTrue(resource.exists());
        assertTrue(resource.isReadable());

        Files.deleteIfExists(resumePath);
    }


    // =========================================================
    // DELETE RESUME
    // =========================================================

    @Test
    void deleteResume_ShouldDeleteResumeSuccessfully()
            throws Exception {

        Path uploadPath =
                Path.of(
                        System.getProperty("user.dir"),
                        "uploads",
                        "resumes"
                );

        Files.createDirectories(uploadPath);

        Path resumePath =
                uploadPath.resolve("delete-resume.pdf");

        Files.write(
                resumePath,
                "Delete Resume".getBytes()
        );

        user.setResumeUrl("delete-resume.pdf");

        Resume resume =
                Resume.builder()
                        .candidate(user)
                        .fileName("delete-resume.pdf")
                        .build();

        when(resumeRepository
                .findTopByCandidateOrderByUploadedAtDesc(user))
                .thenReturn(Optional.of(resume));

        fileService.deleteResume(
                "test@gmail.com"
        );

        assertFalse(
                Files.exists(resumePath)
        );

        assertNull(
                user.getResumeUrl()
        );

        verify(userRepository).save(user);

        verify(resumeRepository)
                .delete(resume);
    }


    // =========================================================
    // DELETE - NO RESUME
    // =========================================================

    @Test
    void deleteResume_ShouldThrowException_WhenNoResumeExists() {

        user.setResumeUrl(null);

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> fileService.deleteResume(
                                "test@gmail.com"
                        )
                );

        assertEquals(
                "No resume found for this candidate.",
                exception.getMessage()
        );

        verify(userRepository, never()).save(any());
    }


    // =========================================================
    // DELETE - USER NOT FOUND
    // =========================================================

    @Test
    void deleteResume_ShouldThrowException_WhenUserNotFound() {

        when(userRepository.findByEmail("unknown@gmail.com"))
                .thenReturn(Optional.empty());

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> fileService.deleteResume(
                                "unknown@gmail.com"
                        )
                );

        assertEquals(
                "User not found",
                exception.getMessage()
        );
    }


    // =========================================================
    // VIEW - USER NOT FOUND
    // =========================================================

    @Test
    void viewResume_ShouldThrowException_WhenUserNotFound() {

        when(userRepository.findByEmail("unknown@gmail.com"))
                .thenReturn(Optional.empty());

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> fileService.viewResume(
                                "unknown@gmail.com"
                        )
                );

        assertEquals(
                "User not found",
                exception.getMessage()
        );
    }
}