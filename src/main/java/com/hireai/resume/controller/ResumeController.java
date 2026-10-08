package com.hireai.resume.controller;

import com.hireai.resume.dto.response.ResumeResponse;
import com.hireai.resume.service.ResumeService;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/resumes")
@Validated
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    // =========================================================
    // UPLOAD RESUME
    // POST /api/v1/resumes
    // =========================================================

    @PostMapping(consumes = "multipart/form-data")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResumeResponse uploadResume(
            @RequestParam("file") @NotNull(message = "Resume file is required")
            MultipartFile file,
            Authentication authentication
    ) {

        String email = getAuthenticatedEmail(authentication);

        return resumeService.uploadResume(
                file,
                email
        );
    }

    // =========================================================
    // GET MY RESUMES
    // GET /api/v1/resumes/my
    // =========================================================

    @GetMapping("/my")
    @PreAuthorize("hasRole('CANDIDATE')")
    public List<ResumeResponse> getMyResumes(
            Authentication authentication
    ) {

        String email = getAuthenticatedEmail(authentication);

        return resumeService.getMyResumes(email);
    }

    // =========================================================
    // GET RESUME INFORMATION
    // GET /api/v1/resumes/{id}
    // =========================================================

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResumeResponse getResumeById(
            @PathVariable
            @Positive(message = "Resume ID must be greater than 0")
            Long id,
            Authentication authentication
    ) {

        String email = getAuthenticatedEmail(authentication);

        return resumeService.getResumeById(
                id,
                email
        );
    }

    // =========================================================
    // VIEW RESUME PDF
    // GET /api/v1/resumes/{id}/view
    // =========================================================

    @GetMapping("/{id}/view")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<Resource> viewResume(
            @PathVariable
            @Positive(message = "Resume ID must be greater than 0")
            Long id,
            Authentication authentication
    ) {

        String email = getAuthenticatedEmail(authentication);

        return resumeService.viewResume(
                id,
                email
        );
    }

    // =========================================================
    // DELETE RESUME
    // DELETE /api/v1/resumes/{id}
    // =========================================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public String deleteResume(
            @PathVariable
            @Positive(message = "Resume ID must be greater than 0")
            Long id,
            Authentication authentication
    ) {

        String email = getAuthenticatedEmail(authentication);

        resumeService.deleteResume(
                id,
                email
        );

        return "Resume deleted successfully";
    }

    // =========================================================
    // HR - GET CANDIDATE RESUME INFORMATION
    // GET /api/v1/resumes/candidate/{candidateId}
    // =========================================================

    @GetMapping("/candidate/{candidateId}")
    @PreAuthorize("hasRole('HR')")
    public ResumeResponse getCandidateResume(
            @PathVariable
            @Positive(message = "Candidate ID must be greater than 0")
            Long candidateId,
            Authentication authentication
    ) {

        String email = getAuthenticatedEmail(authentication);

        return resumeService.getCandidateResume(
                candidateId,
                email
        );
    }

    // =========================================================
    // HR - DOWNLOAD CANDIDATE RESUME
    // GET /api/v1/resumes/candidate/{candidateId}/download
    // =========================================================

    @GetMapping("/candidate/{candidateId}/download")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<Resource> downloadCandidateResume(
            @PathVariable
            @Positive(message = "Candidate ID must be greater than 0")
            Long candidateId,
            Authentication authentication
    ) {

        String email = getAuthenticatedEmail(authentication);

        return resumeService.downloadCandidateResume(
                candidateId,
                email
        );
    }

    // =========================================================
    // AUTHENTICATION VALIDATION
    // =========================================================

    private String getAuthenticatedEmail(
            Authentication authentication
    ) {

        if (authentication == null) {
            throw new IllegalStateException(
                    "Authentication information is unavailable."
            );
        }

        String email = authentication.getName();

        if (email == null || email.isBlank()) {
            throw new IllegalStateException(
                    "Authenticated user email is unavailable."
            );
        }

        return email.trim();
    }
}