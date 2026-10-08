package com.hireai.resume.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hireai.resume.dto.response.ResumeAnalysisResponse;
import com.hireai.resume.dto.response.ResumeResponse;
import com.hireai.resume.service.ResumeAnalysisService;
import com.hireai.resume.service.ResumeService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.Authentication;

import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ResumeControllerTest {

    @Mock
    private ResumeService resumeService;

    @Mock
    private ResumeAnalysisService resumeAnalysisService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private ResumeController resumeController;

    @InjectMocks
    private ResumeAnalysisController resumeAnalysisController;

    private MockMvc resumeMockMvc;
    private MockMvc analysisMockMvc;

    private ObjectMapper objectMapper;

    private final String candidateEmail =
            "candidate@hireai.com";

    private final String hrEmail =
            "hr@hireai.com";

    @BeforeEach
    void setUp() {

        resumeMockMvc =
                MockMvcBuilders
                        .standaloneSetup(resumeController)
                        .build();

        analysisMockMvc =
                MockMvcBuilders
                        .standaloneSetup(
                                resumeAnalysisController
                        )
                        .build();

        objectMapper =
                new ObjectMapper();

        objectMapper.findAndRegisterModules();
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
                        MediaType.APPLICATION_PDF_VALUE,
                        "PDF CONTENT".getBytes()
                );

        ResumeResponse response =
                createResumeResponse(1L);

        when(authentication.getName())
                .thenReturn(candidateEmail);

        when(resumeService.uploadResume(
                any(),
                eq(candidateEmail)
        )).thenReturn(response);

        resumeMockMvc.perform(
                multipart("/api/v1/resumes")
                        .file(file)
                        .principal(authentication)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id")
                .value(1))
        .andExpect(jsonPath("$.fileName")
                .value("resume.pdf"))
        .andExpect(jsonPath("$.candidateEmail")
                .value(candidateEmail));

        verify(resumeService).uploadResume(
                any(),
                eq(candidateEmail)
        );
    }

    // =========================================================
    // GET MY RESUMES - SUCCESS
    // =========================================================

    @Test
    void getMyResumes_ShouldReturn200()
            throws Exception {

        List<ResumeResponse> resumes =
                List.of(
                        createResumeResponse(1L),
                        createResumeResponse(2L)
                );

        when(authentication.getName())
                .thenReturn(candidateEmail);

        when(resumeService.getMyResumes(candidateEmail))
                .thenReturn(resumes);

        resumeMockMvc.perform(
                get("/api/v1/resumes/my")
                        .principal(authentication)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()")
                .value(2))
        .andExpect(jsonPath("$[0].id")
                .value(1))
        .andExpect(jsonPath("$[1].id")
                .value(2));

        verify(resumeService)
                .getMyResumes(candidateEmail);
    }

    // =========================================================
    // GET MY RESUMES - EMPTY
    // =========================================================

    @Test
    void getMyResumes_ShouldReturnEmptyList_WhenNoResumes()
            throws Exception {

        when(authentication.getName())
                .thenReturn(candidateEmail);

        when(resumeService.getMyResumes(candidateEmail))
                .thenReturn(List.of());

        resumeMockMvc.perform(
                get("/api/v1/resumes/my")
                        .principal(authentication)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()")
                .value(0));

        verify(resumeService)
                .getMyResumes(candidateEmail);
    }

    // =========================================================
    // GET RESUME BY ID - SUCCESS
    // =========================================================

    @Test
    void getResumeById_ShouldReturn200_WhenSuccessful()
            throws Exception {

        ResumeResponse response =
                createResumeResponse(10L);

        when(authentication.getName())
                .thenReturn(candidateEmail);

        when(resumeService.getResumeById(
                10L,
                candidateEmail
        )).thenReturn(response);

        resumeMockMvc.perform(
                get("/api/v1/resumes/10")
                        .principal(authentication)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id")
                .value(10))
        .andExpect(jsonPath("$.fileName")
                .value("resume.pdf"))
        .andExpect(jsonPath("$.candidateId")
                .value(100));

        verify(resumeService)
                .getResumeById(
                        10L,
                        candidateEmail
                );
    }

    // =========================================================
    // VIEW RESUME - SUCCESS
    // =========================================================

    @Test
    void viewResume_ShouldReturn200_WhenSuccessful()
            throws Exception {

        Resource resource =
                new ByteArrayResource(
                        "PDF CONTENT".getBytes()
                );

        ResponseEntity<Resource> response =
                ResponseEntity.ok()
                        .contentType(
                                MediaType.APPLICATION_PDF
                        )
                        .body(resource);

        when(authentication.getName())
                .thenReturn(candidateEmail);

        when(resumeService.viewResume(
                20L,
                candidateEmail
        )).thenReturn(response);

        resumeMockMvc.perform(
                get("/api/v1/resumes/20/view")
                        .principal(authentication)
        )
        .andExpect(status().isOk())
        .andExpect(
                content().contentType(
                        MediaType.APPLICATION_PDF
                )
        );

        verify(resumeService)
                .viewResume(
                        20L,
                        candidateEmail
                );
    }

    // =========================================================
    // DELETE RESUME - SUCCESS
    // =========================================================

    @Test
    void deleteResume_ShouldReturn200_WhenSuccessful()
            throws Exception {

        when(authentication.getName())
                .thenReturn(candidateEmail);

        doNothing().when(resumeService)
                .deleteResume(
                        30L,
                        candidateEmail
                );

        resumeMockMvc.perform(
                delete("/api/v1/resumes/30")
                        .principal(authentication)
        )
        .andExpect(status().isOk())
        .andExpect(
                content().string(
                        "Resume deleted successfully"
                )
        );

        verify(resumeService)
                .deleteResume(
                        30L,
                        candidateEmail
                );
    }

    // =========================================================
    // GET CANDIDATE RESUME - HR
    // =========================================================

    @Test
    void getCandidateResume_ShouldReturn200_WhenSuccessful()
            throws Exception {

        ResumeResponse response =
                createResumeResponse(40L);

        when(authentication.getName())
                .thenReturn(hrEmail);

        when(resumeService.getCandidateResume(
                100L,
                hrEmail
        )).thenReturn(response);

        resumeMockMvc.perform(
                get("/api/v1/resumes/candidate/100")
                        .principal(authentication)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id")
                .value(40))
        .andExpect(jsonPath("$.candidateId")
                .value(100))
        .andExpect(jsonPath("$.candidateEmail")
                .value(candidateEmail));

        verify(resumeService)
                .getCandidateResume(
                        100L,
                        hrEmail
                );
    }

    // =========================================================
    // DOWNLOAD CANDIDATE RESUME - HR
    // =========================================================

    @Test
    void downloadCandidateResume_ShouldReturn200_WhenSuccessful()
            throws Exception {

        Resource resource =
                new ByteArrayResource(
                        "PDF CONTENT".getBytes()
                );

        ResponseEntity<Resource> response =
                ResponseEntity.ok()
                        .contentType(
                                MediaType.APPLICATION_PDF
                        )
                        .body(resource);

        when(authentication.getName())
                .thenReturn(hrEmail);

        when(resumeService.downloadCandidateResume(
                100L,
                hrEmail
        )).thenReturn(response);

        resumeMockMvc.perform(
                get(
                        "/api/v1/resumes/candidate/100/download"
                )
                .principal(authentication)
        )
        .andExpect(status().isOk())
        .andExpect(
                content().contentType(
                        MediaType.APPLICATION_PDF
                )
        );

        verify(resumeService)
                .downloadCandidateResume(
                        100L,
                        hrEmail
                );
    }

    // =========================================================
    // RESUME RESPONSE - COMPLETE DATA
    // =========================================================

    @Test
    void getResumeById_ShouldReturnCompleteResumeData()
            throws Exception {

        ResumeResponse response =
                ResumeResponse.builder()
                        .id(50L)
                        .fileName("Debashis_Resume.pdf")
                        .fileUrl(
                                "/uploads/resumes/resume-50.pdf"
                        )
                        .contentType(
                                MediaType.APPLICATION_PDF_VALUE
                        )
                        .fileSize(250000L)
                        .uploadedAt(
                                LocalDateTime.of(
                                        2026,
                                        8,
                                        10,
                                        12,
                                        30
                                )
                        )
                        .candidateId(100L)
                        .candidateName(
                                "Debashis Satapathy"
                        )
                        .candidateEmail(
                                candidateEmail
                        )
                        .resumeUrl(
                                "/uploads/resumes/resume-50.pdf"
                        )
                        .build();

        when(authentication.getName())
                .thenReturn(candidateEmail);

        when(resumeService.getResumeById(
                50L,
                candidateEmail
        )).thenReturn(response);

        resumeMockMvc.perform(
                get("/api/v1/resumes/50")
                        .principal(authentication)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id")
                .value(50))
        .andExpect(jsonPath("$.fileName")
                .value("Debashis_Resume.pdf"))
        .andExpect(jsonPath("$.fileUrl")
                .value(
                        "/uploads/resumes/resume-50.pdf"
                ))
        .andExpect(jsonPath("$.contentType")
                .value(
                        MediaType.APPLICATION_PDF_VALUE
                ))
        .andExpect(jsonPath("$.fileSize")
                .value(250000))
        .andExpect(jsonPath("$.candidateId")
                .value(100))
        .andExpect(jsonPath("$.candidateName")
                .value(
                        "Debashis Satapathy"
                ))
        .andExpect(jsonPath("$.candidateEmail")
                .value(candidateEmail))
        .andExpect(jsonPath("$.resumeUrl")
                .value(
                        "/uploads/resumes/resume-50.pdf"
                ));

        verify(resumeService)
                .getResumeById(
                        50L,
                        candidateEmail
                );
    }

    // =========================================================
    // RESUME ANALYSIS - SUCCESS
    // =========================================================

    @Test
    void analyzeResume_ShouldReturn200_WhenSuccessful()
            throws Exception {

        ResumeAnalysisResponse response =
                createAnalysisResponse(60L);

        when(authentication.getName())
                .thenReturn(candidateEmail);

        when(resumeAnalysisService.analyzeResume(
                60L,
                candidateEmail
        )).thenReturn(response);

        analysisMockMvc.perform(
                post("/api/v1/resumes/60/analyze")
                        .principal(authentication)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.resumeId")
                .value(60))
        .andExpect(jsonPath("$.overallScore")
                .value(85))
        .andExpect(jsonPath("$.summary")
                .value(
                        "Strong Java Spring Boot profile"
                ));

        verify(resumeAnalysisService)
                .analyzeResume(
                        60L,
                        candidateEmail
                );
    }

    // =========================================================
    // RESUME ANALYSIS - COMPLETE DATA
    // =========================================================

    @Test
    void analyzeResume_ShouldReturnCompleteAnalysisData()
            throws Exception {

        ResumeAnalysisResponse response =
                ResumeAnalysisResponse.builder()
                        .resumeId(70L)
                        .overallScore(90)
                        .summary(
                                "Excellent backend development profile"
                        )
                        .skills(
                                "Java, Spring Boot, MySQL"
                        )
                        .strengths(
                                "Strong backend and API development"
                        )
                        .weaknesses(
                                "Limited cloud experience"
                        )
                        .missingSkills(
                                "AWS, Docker"
                        )
                        .recommendedRoles(
                                "Java Backend Developer"
                        )
                        .experienceLevel(
                                "Entry Level"
                        )
                        .build();

        when(authentication.getName())
                .thenReturn(candidateEmail);

        when(resumeAnalysisService.analyzeResume(
                70L,
                candidateEmail
        )).thenReturn(response);

        analysisMockMvc.perform(
                post("/api/v1/resumes/70/analyze")
                        .principal(authentication)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.resumeId")
                .value(70))
        .andExpect(jsonPath("$.overallScore")
                .value(90))
        .andExpect(jsonPath("$.summary")
                .value(
                        "Excellent backend development profile"
                ))
        .andExpect(jsonPath("$.skills")
                .value(
                        "Java, Spring Boot, MySQL"
                ))
        .andExpect(jsonPath("$.strengths")
                .value(
                        "Strong backend and API development"
                ))
        .andExpect(jsonPath("$.weaknesses")
                .value(
                        "Limited cloud experience"
                ))
        .andExpect(jsonPath("$.missingSkills")
                .value(
                        "AWS, Docker"
                ))
        .andExpect(jsonPath("$.recommendedRoles")
                .value(
                        "Java Backend Developer"
                ))
        .andExpect(jsonPath("$.experienceLevel")
                .value(
                        "Entry Level"
                ));

        verify(resumeAnalysisService)
                .analyzeResume(
                        70L,
                        candidateEmail
                );
    }

    // =========================================================
    // HELPERS
    // =========================================================

    private ResumeResponse createResumeResponse(
            Long id
    ) {

        return ResumeResponse.builder()

                .id(id)

                .fileName("resume.pdf")

                .fileUrl(
                        "/uploads/resumes/resume.pdf"
                )

                .contentType(
                        MediaType.APPLICATION_PDF_VALUE
                )

                .fileSize(150000L)

                .uploadedAt(
                        LocalDateTime.now()
                )

                .candidateId(100L)

                .candidateName(
                        "Debashis Satapathy"
                )

                .candidateEmail(
                        candidateEmail
                )

                .resumeUrl(
                        "/uploads/resumes/resume.pdf"
                )

                .build();
    }

    private ResumeAnalysisResponse createAnalysisResponse(
            Long resumeId
    ) {

        return ResumeAnalysisResponse.builder()

                .resumeId(resumeId)

                .overallScore(85)

                .summary(
                        "Strong Java Spring Boot profile"
                )

                .skills(
                        "Java, Spring Boot, MySQL"
                )

                .strengths(
                        "Strong backend development"
                )

                .weaknesses(
                        "Limited cloud experience"
                )

                .missingSkills(
                        "AWS, Docker"
                )

                .recommendedRoles(
                        "Java Backend Developer"
                )

                .experienceLevel(
                        "Entry Level"
                )

                .build();
    }
}