package com.hireai.resume.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hireai.resume.dto.response.ResumeAnalysisResponse;
import com.hireai.resume.entity.Resume;
import com.hireai.resume.repository.ResumeRepository;
import com.hireai.resume.service.ResumeAnalysisService;
import com.hireai.user.entity.User;
import com.hireai.user.repository.UserRepository;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ResumeAnalysisServiceImpl implements ResumeAnalysisService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    public ResumeAnalysisServiceImpl(
            ResumeRepository resumeRepository,
            UserRepository userRepository,
            ChatClient.Builder chatClientBuilder,
            ObjectMapper objectMapper) {

        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
        this.chatClient = chatClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public ResumeAnalysisResponse analyzeResume(
            Long resumeId,
            String email) {

        // =====================================================
        // VALIDATE INPUT
        // =====================================================

        if (resumeId == null || resumeId <= 0) {
            throw new IllegalArgumentException(
                    "Resume ID must be greater than 0"
            );
        }

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "Candidate email is required"
            );
        }

        String normalizedEmail = email.trim().toLowerCase();

        // =====================================================
        // FIND CANDIDATE
        // =====================================================

        User candidate = userRepository
                .findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Candidate not found"
                        )
                );

        // =====================================================
        // FIND RESUME
        // =====================================================

        Resume resume = resumeRepository
                .findByIdAndCandidate(resumeId, candidate)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Resume not found"
                        )
                );

        // =====================================================
        // CHECK EXTRACTED TEXT
        // =====================================================

        String extractedText = resume.getExtractedText();

        if (extractedText == null || extractedText.isBlank()) {
            throw new IllegalStateException(
                    "No extracted text found in resume."
            );
        }

        // =====================================================
        // BUILD AI PROMPT
        // =====================================================

        String prompt = """
                You are an expert technical recruiter.

                Analyze the following candidate resume.

                Resume:
                __RESUME_TEXT__

                Return ONLY valid JSON.

                Do NOT use markdown.
                Do NOT use ```json.
                Do NOT add any explanation outside the JSON.

                Use exactly this JSON structure:

                {
                  "overallScore": 72,
                  "summary": "Short professional summary",
                  "skills": "Java, Spring Boot, MySQL",
                  "strengths": "Strong backend development skills",
                  "weaknesses": "Limited professional experience",
                  "missingSkills": "JUnit, Mockito, Docker, AWS",
                  "recommendedRoles": "Junior Java Developer, Backend Developer",
                  "experienceLevel": "Entry-Level / Fresher"
                }

                Rules:

                1. overallScore must be an integer between 0 and 100.
                2. summary must be concise and professional.
                3. skills must contain skills actually found in the resume.
                4. strengths must be based only on the resume.
                5. weaknesses must be realistic and relevant.
                6. missingSkills should contain useful skills that are missing
                   for the candidate's target technical roles.
                7. recommendedRoles should contain suitable job roles.
                8. experienceLevel should describe the candidate's experience level.
                9. Do not invent companies, jobs, education, projects or skills.
                10. Return valid JSON only.
                """;

        /*
         * Do not use String.formatted() here.
         *
         * The prompt contains JSON and may contain '%' characters
         * from resume text. Using formatted() can cause
         * MissingFormatArgumentException / IllegalFormatException.
         */
        prompt = prompt.replace(
                "__RESUME_TEXT__",
                extractedText
        );

        // =====================================================
        // CALL GEMINI THROUGH SPRING AI
        // =====================================================

        String aiResponse = chatClient
                .prompt()
                .user(prompt)
                .call()
                .content();

        // =====================================================
        // VALIDATE AI RESPONSE
        // =====================================================

        if (aiResponse == null || aiResponse.isBlank()) {
            throw new IllegalStateException(
                    "AI returned an empty response."
            );
        }

        // =====================================================
        // CLEAN AI RESPONSE
        // =====================================================

        aiResponse = cleanAiResponse(aiResponse);

        if (aiResponse.isBlank()) {
            throw new IllegalStateException(
                    "AI returned an empty response."
            );
        }

        // =====================================================
        // PARSE JSON
        // =====================================================

        try {

            ResumeAnalysisResponse response =
                    objectMapper.readValue(
                            aiResponse,
                            ResumeAnalysisResponse.class
                    );

            if (response == null) {
                throw new IllegalStateException(
                        "AI returned an empty analysis response."
                );
            }

            // =================================================
            // VALIDATE SCORE
            // =================================================

            Integer score = response.getOverallScore();

            if (score == null) {
                throw new IllegalStateException(
                        "AI analysis did not contain an overall score."
                );
            }

            if (score < 0 || score > 100) {
                throw new IllegalStateException(
                        "AI analysis score must be between 0 and 100."
                );
            }

            // =================================================
            // RESUME ID MUST COME FROM DATABASE
            // =================================================

            response.setResumeId(resume.getId());

            return response;

        } catch (IllegalStateException ex) {

            throw ex;

        } catch (Exception ex) {

            throw new IllegalStateException(
                    "Failed to parse AI resume analysis response.",
                    ex
            );
        }
    }

    // =========================================================
    // CLEAN AI RESPONSE
    // =========================================================

    private String cleanAiResponse(String aiResponse) {

        String cleaned = aiResponse.trim();

        /*
         * Remove ```json
         */
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7).trim();
        }

        /*
         * Remove generic ```
         */
        else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3).trim();
        }

        /*
         * Remove closing ```
         */
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(
                    0,
                    cleaned.length() - 3
            ).trim();
        }

        return cleaned;
    }
}