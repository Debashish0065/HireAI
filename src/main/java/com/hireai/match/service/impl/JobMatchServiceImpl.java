package com.hireai.match.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.hireai.job.entity.Job;
import com.hireai.job.repository.JobRepository;

import com.hireai.match.dto.request.JobMatchRequest;
import com.hireai.match.dto.response.JobMatchResponse;
import com.hireai.match.entity.JobMatch;
import com.hireai.match.repository.JobMatchRepository;
import com.hireai.match.service.JobMatchService;

import com.hireai.resume.entity.Resume;
import com.hireai.resume.repository.ResumeRepository;

import com.hireai.user.entity.User;
import com.hireai.user.repository.UserRepository;

import jakarta.transaction.Transactional;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
public class JobMatchServiceImpl implements JobMatchService {

    private static final int MIN_MATCH_SCORE = 0;
    private static final int MAX_MATCH_SCORE = 100;

    private static final List<String> VALID_RECOMMENDATIONS = List.of(
            "Highly Recommended",
            "Recommended",
            "Moderate Match",
            "Low Match"
    );

    private final JobMatchRepository jobMatchRepository;
    private final ResumeRepository resumeRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    public JobMatchServiceImpl(
            JobMatchRepository jobMatchRepository,
            ResumeRepository resumeRepository,
            JobRepository jobRepository,
            UserRepository userRepository,
            ChatClient.Builder chatClientBuilder,
            ObjectMapper objectMapper
    ) {
        this.jobMatchRepository = jobMatchRepository;
        this.resumeRepository = resumeRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.chatClient = chatClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    // =========================================================
    // AI MATCH RESUME WITH JOB
    // =========================================================

    @Override
    @Transactional
    public JobMatchResponse matchResumeWithJob(
            JobMatchRequest request,
            String email
    ) {

        validateRequest(request);

        String normalizedEmail = normalizeEmail(email);

        // -----------------------------------------------------
        // FIND CANDIDATE
        // -----------------------------------------------------

        User candidate = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException("Candidate not found")
                );

        // -----------------------------------------------------
        // FIND RESUME
        // -----------------------------------------------------

        Resume resume = resumeRepository.findByIdAndCandidate(
                        request.getResumeId(),
                        candidate
                )
                .orElseThrow(() ->
                        new IllegalArgumentException("Resume not found")
                );

        // -----------------------------------------------------
        // CHECK RESUME TEXT
        // -----------------------------------------------------

        if (isBlank(resume.getExtractedText())) {
            throw new IllegalStateException(
                    "No extracted text found in resume."
            );
        }

        // -----------------------------------------------------
        // FIND JOB
        // -----------------------------------------------------

        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Job not found")
                );

        // -----------------------------------------------------
        // CHECK EXISTING MATCH
        // -----------------------------------------------------

        JobMatch existingMatch = jobMatchRepository
                .findByResumeAndJob(resume, job)
                .orElse(null);

        if (existingMatch != null) {
            return mapToResponse(existingMatch);
        }

        // -----------------------------------------------------
        // BUILD AI PROMPT
        // -----------------------------------------------------

        String prompt = buildMatchingPrompt(resume, job);

        // -----------------------------------------------------
        // CALL AI
        // -----------------------------------------------------

        String aiResponse;

        try {

            aiResponse = chatClient
                    .prompt()
                    .user(prompt)
                    .call()
                    .content();

        } catch (Exception e) {

            throw new IllegalStateException(
                    "Failed to generate AI job match.",
                    e
            );
        }

        if (isBlank(aiResponse)) {
            throw new IllegalStateException(
                    "AI returned an empty response."
            );
        }

        // -----------------------------------------------------
        // PARSE AI RESPONSE
        // -----------------------------------------------------

        JobMatchAnalysis analysis =
                parseAiResponse(aiResponse);

        // -----------------------------------------------------
        // SAVE JOB MATCH
        // -----------------------------------------------------

        JobMatch jobMatch = JobMatch.builder()
                .resume(resume)
                .job(job)
                .matchScore(analysis.matchScore())
                .matchingSkills(analysis.matchingSkills())
                .missingSkills(analysis.missingSkills())
                .strengths(analysis.strengths())
                .recommendation(analysis.recommendation())
                .build();

        JobMatch savedMatch =
                jobMatchRepository.save(jobMatch);

        return mapToResponse(savedMatch);
    }

    // =========================================================
    // GET MY MATCHES
    // =========================================================

    @Override
    @Transactional(Transactional.TxType.SUPPORTS)
    public List<JobMatchResponse> getMyMatches(
            String email
    ) {

        String normalizedEmail = normalizeEmail(email);

        User candidate = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException("Candidate not found")
                );

        List<Resume> resumes =
                resumeRepository.findByCandidate(candidate);

        if (resumes == null || resumes.isEmpty()) {
            return List.of();
        }

        return resumes.stream()
                .flatMap(resume -> {

                    List<JobMatch> matches =
                            jobMatchRepository.findByResume(resume);

                    if (matches == null) {
                        return java.util.stream.Stream.empty();
                    }

                    return matches.stream();
                })
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // GET MATCH BY ID
    // =========================================================

    @Override
    @Transactional(Transactional.TxType.SUPPORTS)
    public JobMatchResponse getMatchById(
            Long matchId,
            String email
    ) {

        validateMatchId(matchId);

        String normalizedEmail = normalizeEmail(email);

        User candidate = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException("Candidate not found")
                );

        JobMatch match = jobMatchRepository.findById(matchId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Job match not found")
                );

        // -----------------------------------------------------
        // OWNERSHIP / SECURITY CHECK
        // -----------------------------------------------------

        Resume resume = match.getResume();

        if (resume == null ||
                resume.getCandidate() == null ||
                resume.getCandidate().getId() == null ||
                candidate.getId() == null ||
                !resume.getCandidate()
                        .getId()
                        .equals(candidate.getId())) {

            throw new IllegalArgumentException(
                    "You cannot access this job match."
            );
        }

        return mapToResponse(match);
    }

    // =========================================================
    // BUILD AI PROMPT
    // =========================================================

    private String buildMatchingPrompt(
            Resume resume,
            Job job
    ) {

        return """
                You are an expert technical recruiter
                and AI job matching system.

                Analyze how well the candidate's resume
                matches the given job.

                ================================
                CANDIDATE RESUME
                ================================

                %s

                ================================
                JOB DETAILS
                ================================

                Job Title:
                %s

                Company:
                %s

                Location:
                %s

                Job Type:
                %s

                Job Description:
                %s

                ================================
                INSTRUCTIONS
                ================================

                Compare the candidate's skills,
                experience, projects and education
                against the job requirements.

                Calculate an overall match score
                between 0 and 100.

                Do not invent information.

                Return ONLY valid JSON.

                Use exactly this structure:

                {
                  "matchScore": 0,
                  "matchingSkills": "",
                  "missingSkills": "",
                  "strengths": "",
                  "recommendation": ""
                }

                The text fields may be empty when
                there is no relevant information.

                recommendation must be exactly one of:

                "Highly Recommended"
                "Recommended"
                "Moderate Match"
                "Low Match"
                """.formatted(
                resume.getExtractedText(),
                safeText(job.getTitle()),
                safeText(job.getCompanyName()),
                safeText(job.getLocation()),
                job.getJobType() == null
                        ? ""
                        : job.getJobType().name(),
                safeText(job.getDescription())
        );
    }

    // =========================================================
    // PARSE AI RESPONSE
    // =========================================================

    private JobMatchAnalysis parseAiResponse(
            String aiResponse
    ) {

        try {

            String cleanResponse =
                    cleanJsonResponse(aiResponse);

            if (cleanResponse.isBlank()) {
                throw new IllegalStateException(
                        "AI returned an empty JSON response."
                );
            }

            JsonNode json =
                    objectMapper.readTree(cleanResponse);

            if (json == null || !json.isObject()) {
                throw new IllegalStateException(
                        "AI returned an invalid JSON object."
                );
            }

            // -------------------------------------------------
            // MATCH SCORE
            // -------------------------------------------------

            JsonNode scoreNode =
                    json.get("matchScore");

            if (scoreNode == null ||
                    !scoreNode.isNumber()) {

                throw new IllegalStateException(
                        "AI response does not contain a valid match score."
                );
            }

            int matchScore =
                    scoreNode.asInt();

            /*
             * Keep the existing project/test behavior:
             * scores below 0 become 0 and scores above 100
             * become 100.
             */
            if (matchScore < MIN_MATCH_SCORE) {
                matchScore = MIN_MATCH_SCORE;
            }

            if (matchScore > MAX_MATCH_SCORE) {
                matchScore = MAX_MATCH_SCORE;
            }

            // -------------------------------------------------
            // TEXT FIELDS
            // -------------------------------------------------

            /*
             * These fields are allowed to be empty.
             *
             * Example:
             *
             * "matchingSkills": "Java, Spring Boot",
             * "missingSkills": "",
             * "strengths": "Strong backend experience"
             *
             * Empty values are converted to an empty String.
             */

            String matchingSkills =
                    getJsonText(
                            json,
                            "matchingSkills"
                    );

            String missingSkills =
                    getJsonText(
                            json,
                            "missingSkills"
                    );

            String strengths =
                    getJsonText(
                            json,
                            "strengths"
                    );

            String recommendation =
                    getJsonText(
                            json,
                            "recommendation"
                    );

            // -------------------------------------------------
            // RECOMMENDATION VALIDATION
            // -------------------------------------------------

            if (!VALID_RECOMMENDATIONS.contains(
                    recommendation
            )) {

                throw new IllegalStateException(
                        "AI returned an invalid recommendation."
                );
            }

            return new JobMatchAnalysis(
                    matchScore,
                    matchingSkills,
                    missingSkills,
                    strengths,
                    recommendation
            );

        } catch (IllegalStateException e) {

            throw e;

        } catch (Exception e) {

            throw new IllegalStateException(
                    "Failed to process AI job match response: "
                            + e.getMessage(),
                    e
            );
        }
    }

    // =========================================================
    // ENTITY -> RESPONSE DTO
    // =========================================================

    private JobMatchResponse mapToResponse(
            JobMatch match
    ) {

        if (match == null) {
            throw new IllegalArgumentException(
                    "Job match cannot be null"
            );
        }

        Resume resume = match.getResume();

        if (resume == null) {
            throw new IllegalStateException(
                    "Job match resume information is unavailable."
            );
        }

        Job job = match.getJob();

        if (job == null) {
            throw new IllegalStateException(
                    "Job match job information is unavailable."
            );
        }

        return JobMatchResponse.builder()
                .id(match.getId())
                .resumeId(resume.getId())
                .jobId(job.getId())
                .jobTitle(job.getTitle())
                .companyName(job.getCompanyName())
                .matchScore(match.getMatchScore())
                .matchingSkills(match.getMatchingSkills())
                .missingSkills(match.getMissingSkills())
                .strengths(match.getStrengths())
                .recommendation(match.getRecommendation())
                .createdAt(match.getCreatedAt())
                .build();
    }

    // =========================================================
    // REQUEST VALIDATION
    // =========================================================

    private void validateRequest(
            JobMatchRequest request
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Job match request is required."
            );
        }

        if (request.getResumeId() == null ||
                request.getResumeId() <= 0) {

            throw new IllegalArgumentException(
                    "Resume ID must be greater than 0."
            );
        }

        if (request.getJobId() == null ||
                request.getJobId() <= 0) {

            throw new IllegalArgumentException(
                    "Job ID must be greater than 0."
            );
        }
    }

    // =========================================================
    // MATCH ID VALIDATION
    // =========================================================

    private void validateMatchId(
            Long matchId
    ) {

        if (matchId == null || matchId <= 0) {

            throw new IllegalArgumentException(
                    "Job match ID must be greater than 0."
            );
        }
    }

    // =========================================================
    // EMAIL NORMALIZATION
    // =========================================================

    private String normalizeEmail(
            String email
    ) {

        if (isBlank(email)) {
            throw new IllegalArgumentException(
                    "Authenticated user email is required."
            );
        }

        return email
                .trim()
                .toLowerCase(Locale.ROOT);
    }

    // =========================================================
    // AI JSON TEXT
    // =========================================================

    /**
     * Reads a text field from the AI JSON response.
     *
     * Missing/null text fields are treated as empty strings.
     * Non-text values are rejected because the AI contract
     * expects these fields to contain textual information.
     */
    private String getJsonText(
            JsonNode json,
            String field
    ) {

        JsonNode node = json.get(field);

        if (node == null || node.isNull()) {
            return "";
        }

        if (!node.isTextual()) {
            throw new IllegalStateException(
                    "AI response contains an invalid field: "
                            + field
            );
        }

        return node.asText().trim();
    }

    // =========================================================
    // CLEAN AI JSON RESPONSE
    // =========================================================

    private String cleanJsonResponse(
            String response
    ) {

        if (response == null) {
            return "";
        }

        String cleaned = response.trim();

        if (cleaned.startsWith("```json")) {

            cleaned = cleaned
                    .substring(7)
                    .trim();

        } else if (cleaned.startsWith("```")) {

            cleaned = cleaned
                    .substring(3)
                    .trim();
        }

        if (cleaned.endsWith("```")) {

            cleaned = cleaned.substring(
                    0,
                    cleaned.length() - 3
            ).trim();
        }

        return cleaned;
    }

    // =========================================================
    // SAFE TEXT
    // =========================================================

    private String safeText(
            String value
    ) {

        return value == null
                ? ""
                : value.trim();
    }

    // =========================================================
    // BLANK CHECK
    // =========================================================

    private boolean isBlank(
            String value
    ) {

        return value == null ||
                value.isBlank();
    }

    // =========================================================
    // AI RESULT
    // =========================================================

    private record JobMatchAnalysis(
            int matchScore,
            String matchingSkills,
            String missingSkills,
            String strengths,
            String recommendation
    ) {
    }
}