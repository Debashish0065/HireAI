package com.hireai.file.controller;

import com.hireai.file.service.FileService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.Authentication;

import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;


@ExtendWith(MockitoExtension.class)
class FileControllerTest {

    @Mock
    private FileService fileService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private FileController fileController;

    private MockMvc mockMvc;

    private final String candidateEmail =
            "candidate@hireai.com";


    // =========================================================
    // SETUP
    // =========================================================

    @BeforeEach
    void setUp() {

        mockMvc =
                MockMvcBuilders
                        .standaloneSetup(fileController)
                        .build();
    }


    // =========================================================
    // UPLOAD RESUME - SUCCESS
    // =========================================================

    @Test
    void uploadResume_ShouldReturn200_WhenSuccessful()
            throws Exception {

        MockMultipartFile file =
                new MockMultipartFile(
                        "file",
                        "resume.pdf",
                        "application/pdf",
                        "PDF CONTENT".getBytes()
                );

        when(authentication.getName())
                .thenReturn(candidateEmail);

        when(fileService.uploadResume(
                any(),
                eq(candidateEmail)
        )).thenReturn("resume.pdf");

        mockMvc.perform(
                multipart("/api/v1/files/resume")
                        .file(file)
                        .principal(authentication)
        )
        .andExpect(status().isOk())
        .andExpect(
                content().string(
                        "Resume uploaded successfully: resume.pdf"
                )
        );

        verify(fileService).uploadResume(
                any(),
                eq(candidateEmail)
        );
    }


    // =========================================================
    // UPLOAD RESUME - AUTHENTICATED EMAIL
    // =========================================================

    @Test
    void uploadResume_ShouldUseAuthenticatedEmail()
            throws Exception {

        MockMultipartFile file =
                new MockMultipartFile(
                        "file",
                        "my-resume.pdf",
                        "application/pdf",
                        "PDF CONTENT".getBytes()
                );

        when(authentication.getName())
                .thenReturn(candidateEmail);

        when(fileService.uploadResume(
                any(),
                eq(candidateEmail)
        )).thenReturn("my-resume.pdf");

        mockMvc.perform(
                multipart("/api/v1/files/resume")
                        .file(file)
                        .principal(authentication)
        )
        .andExpect(status().isOk());

        verify(fileService).uploadResume(
                any(),
                eq(candidateEmail)
        );
    }


    // =========================================================
    // DOWNLOAD RESUME - SUCCESS
    // =========================================================

    @Test
    void downloadResume_ShouldReturn200_WhenSuccessful()
            throws Exception {

        Resource resource =
                new ByteArrayResource(
                        "DOWNLOAD PDF".getBytes()
                );

        when(authentication.getName())
                .thenReturn(candidateEmail);

        when(fileService.downloadResume(
                candidateEmail
        )).thenReturn(resource);

        mockMvc.perform(
                get("/api/v1/files/resume/download")
                        .principal(authentication)
        )
        .andExpect(status().isOk())
        .andExpect(
                content().contentType(
                        MediaType.APPLICATION_PDF
                )
        )
        .andExpect(
                header().string(
                        "Content-Disposition",
                        "attachment; filename=\"resume.pdf\""
                )
        );

        verify(fileService)
                .downloadResume(candidateEmail);
    }


    // =========================================================
    // DOWNLOAD RESUME - AUTHENTICATED EMAIL
    // =========================================================

    @Test
    void downloadResume_ShouldUseAuthenticatedEmail()
            throws Exception {

        Resource resource =
                new ByteArrayResource(
                        "DOWNLOAD PDF".getBytes()
                );

        when(authentication.getName())
                .thenReturn(candidateEmail);

        when(fileService.downloadResume(
                candidateEmail
        )).thenReturn(resource);

        mockMvc.perform(
                get("/api/v1/files/resume/download")
                        .principal(authentication)
        )
        .andExpect(status().isOk());

        /*
         * Do NOT verify authentication.getName().
         *
         * Spring's FrameworkServlet also calls getName(),
         * so Mockito can see two invocations.
         *
         * Verifying the service call proves that the
         * authenticated email was correctly passed.
         */
        verify(fileService)
                .downloadResume(candidateEmail);
    }


    // =========================================================
    // VIEW RESUME - SUCCESS
    // =========================================================

    @Test
    void viewResume_ShouldReturn200_WhenSuccessful()
            throws Exception {

        Resource resource =
                new ByteArrayResource(
                        "VIEW PDF".getBytes()
                );

        when(authentication.getName())
                .thenReturn(candidateEmail);

        when(fileService.viewResume(
                candidateEmail
        )).thenReturn(resource);

        mockMvc.perform(
                get("/api/v1/files/resume/view")
                        .principal(authentication)
        )
        .andExpect(status().isOk())
        .andExpect(
                content().contentType(
                        MediaType.APPLICATION_PDF
                )
        )
        .andExpect(
                header().string(
                        "Content-Disposition",
                        "inline; filename=\"resume.pdf\""
                )
        );

        verify(fileService)
                .viewResume(candidateEmail);
    }


    // =========================================================
    // VIEW RESUME - AUTHENTICATED EMAIL
    // =========================================================

    @Test
    void viewResume_ShouldUseAuthenticatedEmail()
            throws Exception {

        Resource resource =
                new ByteArrayResource(
                        "VIEW PDF".getBytes()
                );

        when(authentication.getName())
                .thenReturn(candidateEmail);

        when(fileService.viewResume(
                candidateEmail
        )).thenReturn(resource);

        mockMvc.perform(
                get("/api/v1/files/resume/view")
                        .principal(authentication)
        )
        .andExpect(status().isOk());

        verify(fileService)
                .viewResume(candidateEmail);
    }


    // =========================================================
    // DELETE RESUME - SUCCESS
    // =========================================================

    @Test
    void deleteResume_ShouldReturn200_WhenSuccessful()
            throws Exception {

        when(authentication.getName())
                .thenReturn(candidateEmail);

        doNothing().when(fileService)
                .deleteResume(candidateEmail);

        mockMvc.perform(
                delete("/api/v1/files/resume")
                        .principal(authentication)
        )
        .andExpect(status().isOk())
        .andExpect(
                content().string(
                        "Resume deleted successfully."
                )
        );

        verify(fileService)
                .deleteResume(candidateEmail);
    }


    // =========================================================
    // DELETE RESUME - AUTHENTICATED EMAIL
    // =========================================================

    @Test
    void deleteResume_ShouldUseAuthenticatedEmail()
            throws Exception {

        when(authentication.getName())
                .thenReturn(candidateEmail);

        doNothing().when(fileService)
                .deleteResume(candidateEmail);

        mockMvc.perform(
                delete("/api/v1/files/resume")
                        .principal(authentication)
        )
        .andExpect(status().isOk());

        verify(fileService)
                .deleteResume(candidateEmail);
    }

}