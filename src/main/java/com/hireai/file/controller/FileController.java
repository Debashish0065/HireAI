
package com.hireai.file.controller;

import com.hireai.file.service.FileService;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/files")
@Validated
public class FileController {

    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    // =========================================================
    // UPLOAD / REPLACE RESUME
    // =========================================================

    @PostMapping("/resume")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<String> uploadResume(
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) {

        String email = getAuthenticatedEmail(authentication);

        String fileName = fileService.uploadResume(file, email);

        return ResponseEntity.ok(
                "Resume uploaded successfully: " + fileName
        );
    }

    // =========================================================
    // DOWNLOAD RESUME
    // =========================================================

    @GetMapping("/resume/download")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<Resource> downloadResume(
            Authentication authentication
    ) {

        String email = getAuthenticatedEmail(authentication);

        Resource resource = fileService.downloadResume(email);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment()
                                .filename("resume.pdf")
                                .build()
                                .toString()
                )
                .body(resource);
    }

    // =========================================================
    // VIEW RESUME
    // =========================================================

    @GetMapping("/resume/view")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<Resource> viewResume(
            Authentication authentication
    ) {

        String email = getAuthenticatedEmail(authentication);

        Resource resource = fileService.viewResume(email);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.inline()
                                .filename("resume.pdf")
                                .build()
                                .toString()
                )
                .body(resource);
    }

    // =========================================================
    // DELETE RESUME
    // =========================================================

    @DeleteMapping("/resume")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<String> deleteResume(
            Authentication authentication
    ) {

        String email = getAuthenticatedEmail(authentication);

        fileService.deleteResume(email);

        return ResponseEntity.ok(
                "Resume deleted successfully."
        );
    }

    // =========================================================
    // AUTHENTICATION VALIDATION
    // =========================================================

    private String getAuthenticatedEmail(Authentication authentication) {

        if (authentication == null) {
            throw new IllegalStateException(
                    "Authentication information is unavailable."
            );
        }

        String email = authentication.getName();

        if (email == null || email.isBlank()) {
            throw new IllegalStateException(
                    "Authenticated candidate email is unavailable."
            );
        }

        return email.trim().toLowerCase();
    }
}