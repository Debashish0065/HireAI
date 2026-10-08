package com.hireai.file.service.impl;

import com.hireai.file.service.FileService;
import com.hireai.file.service.PdfTextExtractionService;
import com.hireai.resume.entity.Resume;
import com.hireai.resume.repository.ResumeRepository;
import com.hireai.user.entity.User;
import com.hireai.user.repository.UserRepository;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class FileServiceImpl implements FileService {

    private static final String PDF_CONTENT_TYPE = "application/pdf";

    /**
     * Maximum allowed resume size: 5 MB
     */
    private static final long MAX_RESUME_SIZE = 5 * 1024 * 1024;

    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;
    private final PdfTextExtractionService pdfTextExtractionService;

    public FileServiceImpl(
            UserRepository userRepository,
            ResumeRepository resumeRepository,
            PdfTextExtractionService pdfTextExtractionService
    ) {
        this.userRepository = userRepository;
        this.resumeRepository = resumeRepository;
        this.pdfTextExtractionService = pdfTextExtractionService;
    }

    // =========================================================
    // UPLOAD / REPLACE RESUME
    // =========================================================

    @Override
    @Transactional
    public String uploadResume(
            MultipartFile file,
            String email
    ) {

        String normalizedEmail = normalizeEmail(email);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found")
                );

        validateResumeFile(file);

        /*
         * Validate and sanitize the original filename first.
         * The original filename is not used directly for storage.
         */
        sanitizeOriginalFileName(file.getOriginalFilename());

        Path uploadPath = getUploadPath();

        /*
         * Generate a unique server-side filename.
         *
         * Example:
         * 550e8400-e29b-41d4-a716-446655440000_resume.pdf
         *
         * This prevents different candidates from overwriting
         * each other's resume files.
         */
        String newFileName =
                UUID.randomUUID() + "_resume.pdf";

        Path newFilePath = uploadPath
                .resolve(newFileName)
                .normalize();

        if (!newFilePath.startsWith(uploadPath)) {
            throw new IllegalArgumentException(
                    "Invalid file path."
            );
        }

        /*
         * Keep the old filename until the new resume has been
         * successfully written and processed.
         */
        String oldFileName = user.getResumeUrl();

        try {

            // =================================================
            // CREATE UPLOAD DIRECTORY
            // =================================================

            Files.createDirectories(uploadPath);

            // =================================================
            // SAVE NEW PDF
            // =================================================

            try (InputStream inputStream = file.getInputStream()) {

                Files.copy(
                        inputStream,
                        newFilePath,
                        StandardCopyOption.REPLACE_EXISTING
                );
            }

            // =================================================
            // VERIFY STORED FILE
            // =================================================

            if (!Files.exists(newFilePath)
                    || !Files.isRegularFile(newFilePath)
                    || Files.size(newFilePath) <= 0) {

                deleteIfExists(newFilePath);

                throw new IllegalStateException(
                        "Uploaded resume could not be stored correctly."
                );
            }

            // =================================================
            // EXTRACT PDF TEXT
            // =================================================

            String extractedText =
                    pdfTextExtractionService.extractText(newFilePath);

            // =================================================
            // FIND OR CREATE RESUME RECORD
            // =================================================

            Resume resume =
                    resumeRepository
                            .findTopByCandidateOrderByUploadedAtDesc(user)
                            .orElseGet(() ->
                                    Resume.builder()
                                            .candidate(user)
                                            .build()
                            );

            // =================================================
            // UPDATE RESUME INFORMATION
            // =================================================

            resume.setFileName(newFileName);

            resume.setFileUrl(
                    "/uploads/resumes/" + newFileName
            );

            resume.setContentType(PDF_CONTENT_TYPE);

            resume.setFileSize(
                    Files.size(newFilePath)
            );

            resume.setExtractedText(extractedText);

            // Save resume record.
            resumeRepository.save(resume);

            // =================================================
            // UPDATE USER RESUME REFERENCE
            // =================================================

            user.setResumeUrl(newFileName);

            userRepository.save(user);

            // =================================================
            // DELETE OLD PHYSICAL FILE
            // =================================================

            if (oldFileName != null
                    && !oldFileName.isBlank()
                    && !oldFileName.equals(newFileName)) {

                Path oldFilePath = uploadPath
                        .resolve(oldFileName)
                        .normalize();

                if (oldFilePath.startsWith(uploadPath)) {
                    deleteIfExists(oldFilePath);
                }
            }

            return newFileName;

        } catch (IOException e) {

            /*
             * If anything fails after the new file was created,
             * remove the new file so we don't leave an orphan.
             */
            deleteIfExists(newFilePath);

            throw new IllegalStateException(
                    "Failed to upload resume.",
                    e
            );

        } catch (RuntimeException e) {

            /*
             * Also clean up when PDF extraction or another
             * runtime operation fails.
             */
            deleteIfExists(newFilePath);

            throw e;
        }
    }

    // =========================================================
    // DOWNLOAD RESUME
    // =========================================================

    @Override
    public Resource downloadResume(String email) {

        String normalizedEmail = normalizeEmail(email);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found")
                );

        String resumeFileName = user.getResumeUrl();

        if (resumeFileName == null
                || resumeFileName.isBlank()) {

            throw new IllegalArgumentException(
                    "No resume found for this candidate."
            );
        }

        Path filePath = resolveResumePath(resumeFileName);

        if (!Files.exists(filePath)) {

            throw new IllegalStateException(
                    "Resume file not found."
            );
        }

        if (!Files.isRegularFile(filePath)) {

            throw new IllegalStateException(
                    "Resume file is invalid."
            );
        }

        try {

            Resource resource =
                    new UrlResource(filePath.toUri());

            if (!resource.exists()
                    || !resource.isReadable()) {

                throw new IllegalStateException(
                        "Resume file cannot be read."
                );
            }

            return resource;

        } catch (IOException e) {

            throw new IllegalStateException(
                    "Failed to load resume.",
                    e
            );
        }
    }

    // =========================================================
    // VIEW RESUME
    // =========================================================

    @Override
    public Resource viewResume(String email) {

        return downloadResume(email);
    }

    // =========================================================
    // DELETE RESUME
    // =========================================================

    @Override
    @Transactional
    public void deleteResume(String email) {

        String normalizedEmail = normalizeEmail(email);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found")
                );

        String resumeFileName = user.getResumeUrl();

        if (resumeFileName == null
                || resumeFileName.isBlank()) {

            throw new IllegalArgumentException(
                    "No resume found for this candidate."
            );
        }

        Path uploadPath = getUploadPath();

        Path filePath = uploadPath
                .resolve(resumeFileName)
                .normalize();

        if (!filePath.startsWith(uploadPath)) {

            throw new IllegalArgumentException(
                    "Invalid file path."
            );
        }

        // =================================================
        // DELETE PHYSICAL FILE
        // =================================================

        deleteIfExists(filePath);

        // =================================================
        // REMOVE USER RESUME REFERENCE
        // =================================================

        user.setResumeUrl(null);

        userRepository.save(user);

        // =================================================
        // REMOVE RESUME DATABASE RECORD
        // =================================================

        resumeRepository
                .findTopByCandidateOrderByUploadedAtDesc(user)
                .ifPresent(resumeRepository::delete);
    }

    // =========================================================
    // VALIDATE RESUME
    // =========================================================

    private void validateResumeFile(MultipartFile file) {

        if (file == null || file.isEmpty()) {

            throw new IllegalArgumentException(
                    "Please select a resume file."
            );
        }

        if (file.getSize() > MAX_RESUME_SIZE) {

            throw new IllegalArgumentException(
                    "Resume file size must not exceed 5 MB."
            );
        }

        String originalFileName = file.getOriginalFilename();

        if (originalFileName == null
                || originalFileName.isBlank()) {

            throw new IllegalArgumentException(
                    "Resume file name is required."
            );
        }

        String sanitizedFileName =
                sanitizeOriginalFileName(originalFileName);

        if (!sanitizedFileName
                .toLowerCase(Locale.ROOT)
                .endsWith(".pdf")) {

            throw new IllegalArgumentException(
                    "Only PDF files are allowed."
            );
        }

        String contentType = file.getContentType();

        if (contentType != null
                && !contentType.isBlank()
                && !PDF_CONTENT_TYPE.equalsIgnoreCase(contentType)) {

            throw new IllegalArgumentException(
                    "Only PDF files are allowed."
            );
        }
    }

    // =========================================================
    // SANITIZE ORIGINAL FILE NAME
    // =========================================================

    private String sanitizeOriginalFileName(String originalFileName) {

        if (originalFileName == null
                || originalFileName.isBlank()) {

            throw new IllegalArgumentException(
                    "Resume file name is required."
            );
        }

        /*
         * Remove path information such as:
         *
         * ../../resume.pdf
         * C:\Users\...\resume.pdf
         */
        String fileName = Paths.get(originalFileName)
                .getFileName()
                .toString()
                .trim();

        if (fileName.isBlank()) {

            throw new IllegalArgumentException(
                    "Resume file name is required."
            );
        }

        if (fileName.length() > 255) {

            throw new IllegalArgumentException(
                    "Resume file name cannot exceed 255 characters."
            );
        }

        return fileName;
    }

    // =========================================================
    // RESUME STORAGE PATH
    // =========================================================

    private Path getUploadPath() {

        return Paths.get(
                System.getProperty("user.dir"),
                "uploads",
                "resumes"
        )
        .toAbsolutePath()
        .normalize();
    }

    // =========================================================
    // RESOLVE RESUME PATH SAFELY
    // =========================================================

    private Path resolveResumePath(String fileName) {

        if (fileName == null || fileName.isBlank()) {

            throw new IllegalArgumentException(
                    "Resume file name is required."
            );
        }

        Path uploadPath = getUploadPath();

        Path filePath = uploadPath
                .resolve(fileName)
                .normalize();

        if (!filePath.startsWith(uploadPath)) {

            throw new IllegalArgumentException(
                    "Invalid file path."
            );
        }

        return filePath;
    }

    // =========================================================
    // DELETE FILE SAFELY
    // =========================================================

    private void deleteIfExists(Path filePath) {

        if (filePath == null) {
            return;
        }

        try {

            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }

        } catch (IOException e) {

            throw new IllegalStateException(
                    "Failed to delete stored resume file.",
                    e
            );
        }
    }

    // =========================================================
    // NORMALIZE EMAIL
    // =========================================================

    private String normalizeEmail(String email) {

        if (email == null || email.isBlank()) {

            throw new IllegalArgumentException(
                    "Email is required."
            );
        }

        return email
                .trim()
                .toLowerCase(Locale.ROOT);
    }
}