package com.hireai.interview.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hireai.interview.dto.request.InterviewEvaluationRequest;
import com.hireai.interview.dto.response.InterviewEvaluationResponse;
import com.hireai.interview.entity.Interview;
import com.hireai.interview.entity.InterviewEvaluation;
import com.hireai.interview.entity.InterviewQuestion;
import com.hireai.interview.enums.InterviewStatus;
import com.hireai.interview.repository.InterviewEvaluationRepository;
import com.hireai.interview.repository.InterviewQuestionRepository;
import com.hireai.interview.repository.InterviewRepository;
import com.hireai.interview.service.InterviewEvaluationService;
import com.hireai.user.entity.User;
import com.hireai.user.repository.UserRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@Transactional
public class InterviewEvaluationServiceImpl implements InterviewEvaluationService {

    private static final int MIN_SCORE = 0;
    private static final int MAX_SCORE = 100;

    private static final String HIGHLY_RECOMMENDED = "Highly Recommended";
    private static final String RECOMMENDED = "Recommended";
    private static final String MODERATE = "Moderate";
    private static final String NOT_RECOMMENDED = "Not Recommended";

    private final InterviewEvaluationRepository evaluationRepository;
    private final InterviewQuestionRepository questionRepository;
    private final InterviewRepository interviewRepository;
    private final UserRepository userRepository;
    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    public InterviewEvaluationServiceImpl(
            InterviewEvaluationRepository evaluationRepository,
            InterviewQuestionRepository questionRepository,
            InterviewRepository interviewRepository,
            UserRepository userRepository,
            ChatClient.Builder chatClientBuilder,
            ObjectMapper objectMapper
    ) {
        this.evaluationRepository = evaluationRepository;
        this.questionRepository = questionRepository;
        this.interviewRepository = interviewRepository;
        this.userRepository = userRepository;
        this.chatClient = chatClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    // =========================================================
    // EVALUATE INTERVIEW
    // =========================================================

    @Override
    public InterviewEvaluationResponse evaluateInterview(
            InterviewEvaluationRequest request,
            String email
    ) {
        validateRequest(request);

        String normalizedEmail = normalizeEmail(email);

        User candidate = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException("Candidate not found.")
                );

        Interview interview = interviewRepository
                .findByIdAndCandidate(request.getInterviewId(), candidate)
                .orElseThrow(() ->
                        new IllegalArgumentException("Interview not found.")
                );

        validateInterviewForEvaluation(interview);

        /*
         * Evaluation is idempotent.
         *
         * If the interview has already been evaluated,
         * return the existing evaluation instead of calling AI again.
         */
        return evaluationRepository.findByInterview(interview)
                .map(this::mapToResponse)
                .orElseGet(() -> createEvaluation(interview));
    }

    // =========================================================
    // VALIDATE INTERVIEW
    // =========================================================

    private void validateInterviewForEvaluation(Interview interview) {

        if (interview == null) {
            throw new IllegalArgumentException(
                    "Interview is required."
            );
        }

        if (interview.getStatus() == null) {
            throw new IllegalStateException(
                    "Interview status is unavailable."
            );
        }

        if (interview.getStatus() == InterviewStatus.CANCELLED) {
            throw new IllegalStateException(
                    "Cancelled interviews cannot be evaluated."
            );
        }

        if (interview.getStatus() != InterviewStatus.COMPLETED) {
            throw new IllegalStateException(
                    "Interview must be completed before evaluation."
            );
        }
    }

    // =========================================================
    // CREATE AI EVALUATION
    // =========================================================

    private InterviewEvaluationResponse createEvaluation(
            Interview interview
    ) {

        List<InterviewQuestion> questions =
                questionRepository.findByInterviewOrderByQuestionNumberAsc(
                        interview
                );

        if (questions == null || questions.isEmpty()) {
            throw new IllegalStateException(
                    "No interview questions found."
            );
        }

        StringBuilder answerContent = new StringBuilder();

        int answeredQuestionCount = 0;

        for (InterviewQuestion question : questions) {

            if (question == null) {
                continue;
            }

            String questionText =
                    safeText(question.getQuestion());

            String candidateAnswer =
                    safeText(question.getCandidateAnswer());

            /*
             * Every valid interview question must have
             * a question text.
             */
            if (questionText.isBlank()) {
                throw new IllegalStateException(
                        "Interview contains a question with empty text."
                );
            }

            /*
             * Every question must be answered before
             * final evaluation.
             */
            if (candidateAnswer.isBlank()) {
                throw new IllegalStateException(
                        "All interview questions must be answered before evaluation."
                );
            }

            /*
             * Every answer must already have an individual
             * AI score.
             */
            if (question.getScore() == null) {
                throw new IllegalStateException(
                        "All interview answers must be evaluated before final evaluation."
                );
            }

            /*
             * Validate the individual answer score.
             */
            if (question.getScore() < MIN_SCORE
                    || question.getScore() > MAX_SCORE) {

                throw new IllegalStateException(
                        "Interview contains an invalid answer score."
                );
            }

            int questionNumber =
                    question.getQuestionNumber() != null
                            ? question.getQuestionNumber()
                            : answeredQuestionCount + 1;

            answerContent
                    .append("Question ")
                    .append(questionNumber)
                    .append(":\n")
                    .append(questionText)
                    .append("\n\n");

            answerContent
                    .append("Candidate Answer:\n")
                    .append(candidateAnswer)
                    .append("\n\n");

            answerContent
                    .append("Answer Score:\n")
                    .append(question.getScore())
                    .append("\n\n");

            String answerFeedback =
                    safeText(question.getFeedback());

            if (!answerFeedback.isBlank()) {

                answerContent
                        .append("Answer Feedback:\n")
                        .append(answerFeedback)
                        .append("\n\n");
            }

            answeredQuestionCount++;
        }

        if (answeredQuestionCount == 0
                || answerContent.isEmpty()) {

            throw new IllegalStateException(
                    "Interview does not contain valid answered questions."
            );
        }

        String prompt = buildEvaluationPrompt(answerContent);

        String aiResponse = callAi(prompt);

        JsonNode json = parseAiResponse(aiResponse);

        Integer overallScore =
                getRequiredScore(json, "overallScore");

        Integer technicalScore =
                getRequiredScore(json, "technicalScore");

        Integer communicationScore =
                getRequiredScore(json, "communicationScore");

        Integer confidenceScore =
                getRequiredScore(json, "confidenceScore");

        String strengths =
                getRequiredText(json, "strengths");

        String weaknesses =
                getRequiredText(json, "weaknesses");

        String feedback =
                getRequiredText(json, "feedback");

        String recommendation =
                getRequiredText(json, "recommendation");

        validateRecommendation(recommendation);

        InterviewEvaluation evaluation =
                InterviewEvaluation.builder()
                        .interview(interview)
                        .overallScore(overallScore)
                        .technicalScore(technicalScore)
                        .communicationScore(communicationScore)
                        .confidenceScore(confidenceScore)
                        .strengths(strengths)
                        .weaknesses(weaknesses)
                        .feedback(feedback)
                        .recommendation(recommendation)
                        .build();

        InterviewEvaluation saved =
                evaluationRepository.save(evaluation);

        return mapToResponse(saved);
    }

    // =========================================================
    // BUILD AI PROMPT
    // =========================================================

    private String buildEvaluationPrompt(
            StringBuilder answerContent
    ) {

        return """
                You are an expert technical interviewer
                and recruitment evaluation system.

                Evaluate the complete candidate interview based ONLY
                on the interview questions, candidate answers,
                individual answer scores, and answer feedback provided below.

                Do not invent information.
                Do not assume information that is not present.

                =================================================
                INTERVIEW ANSWERS
                =================================================

                %s

                =================================================
                EVALUATION CRITERIA
                =================================================

                Evaluate the candidate based on:

                1. Overall performance
                2. Technical knowledge
                3. Communication
                4. Confidence
                5. Accuracy
                6. Relevance
                7. Completeness

                =================================================
                SCORING
                =================================================

                Give every score as an integer from 0 to 100.

                =================================================
                OUTPUT FORMAT
                =================================================

                Return ONLY valid JSON.

                Do not include markdown.
                Do not include ```json.
                Do not include explanations outside the JSON.

                Use exactly this structure:

                {
                  "overallScore": 0,
                  "technicalScore": 0,
                  "communicationScore": 0,
                  "confidenceScore": 0,
                  "strengths": "",
                  "weaknesses": "",
                  "feedback": "",
                  "recommendation": ""
                }

                The recommendation must be exactly one of:

                "Highly Recommended"
                "Recommended"
                "Moderate"
                "Not Recommended"
                """.formatted(answerContent);
    }

    // =========================================================
    // CALL AI
    // =========================================================

    private String callAi(String prompt) {

        try {

            String response = chatClient
                    .prompt()
                    .user(prompt)
                    .call()
                    .content();

            if (response == null || response.isBlank()) {
                throw new IllegalStateException(
                        "AI returned an empty interview evaluation."
                );
            }

            return response;

        } catch (IllegalStateException e) {

            throw e;

        } catch (Exception e) {

            throw new IllegalStateException(
                    "Unable to generate interview evaluation.",
                    e
            );
        }
    }

    // =========================================================
    // PARSE AI RESPONSE
    // =========================================================

    private JsonNode parseAiResponse(String aiResponse) {

        String cleanResponse =
                cleanJsonResponse(aiResponse);

        try {

            JsonNode json =
                    objectMapper.readTree(cleanResponse);

            if (json == null || !json.isObject()) {

                throw new IllegalStateException(
                        "AI returned an invalid evaluation format."
                );
            }

            return json;

        } catch (IllegalStateException e) {

            throw e;

        } catch (Exception e) {

            throw new IllegalStateException(
                    "AI returned invalid JSON for interview evaluation.",
                    e
            );
        }
    }

    // =========================================================
    // GET EVALUATION
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public InterviewEvaluationResponse getEvaluation(
            Long interviewId,
            String email
    ) {

        validateInterviewId(interviewId);

        String normalizedEmail =
                normalizeEmail(email);

        User candidate =
                userRepository.findByEmail(normalizedEmail)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Candidate not found."
                                )
                        );

        Interview interview =
                interviewRepository
                        .findByIdAndCandidate(
                                interviewId,
                                candidate
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Interview not found."
                                )
                        );

        InterviewEvaluation evaluation =
                evaluationRepository
                        .findByInterview(interview)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Interview evaluation not found."
                                )
                        );

        return mapToResponse(evaluation);
    }

    // =========================================================
    // GET MY EVALUATIONS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<InterviewEvaluationResponse> getMyEvaluations(
            String email
    ) {

        String normalizedEmail =
                normalizeEmail(email);

        User candidate =
                userRepository.findByEmail(normalizedEmail)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Candidate not found."
                                )
                        );

        if (candidate.getId() == null) {
            throw new IllegalStateException(
                    "Candidate ID is unavailable."
            );
        }

        return evaluationRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(evaluation ->
                        evaluation != null
                                && evaluation.getInterview() != null
                                && evaluation.getInterview().getCandidate() != null
                                && evaluation.getInterview()
                                .getCandidate()
                                .getId() != null
                                && candidate.getId().equals(
                                evaluation.getInterview()
                                        .getCandidate()
                                        .getId()
                        )
                )
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // MAP RESPONSE
    // =========================================================

    private InterviewEvaluationResponse mapToResponse(
            InterviewEvaluation evaluation
    ) {

        if (evaluation == null) {
            throw new IllegalArgumentException(
                    "Interview evaluation is required."
            );
        }

        Long interviewId = null;

        if (evaluation.getInterview() != null) {
            interviewId =
                    evaluation.getInterview().getId();
        }

        return InterviewEvaluationResponse.builder()
                .id(evaluation.getId())
                .interviewId(interviewId)
                .overallScore(evaluation.getOverallScore())
                .technicalScore(evaluation.getTechnicalScore())
                .communicationScore(
                        evaluation.getCommunicationScore()
                )
                .confidenceScore(
                        evaluation.getConfidenceScore()
                )
                .strengths(evaluation.getStrengths())
                .weaknesses(evaluation.getWeaknesses())
                .feedback(evaluation.getFeedback())
                .recommendation(
                        evaluation.getRecommendation()
                )
                .createdAt(evaluation.getCreatedAt())
                .build();
    }

    // =========================================================
    // REQUEST VALIDATION
    // =========================================================

    private void validateRequest(
            InterviewEvaluationRequest request
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Evaluation request is required."
            );
        }

        validateInterviewId(
                request.getInterviewId()
        );
    }

    private void validateInterviewId(
            Long interviewId
    ) {

        if (interviewId == null || interviewId <= 0) {

            throw new IllegalArgumentException(
                    "Interview ID must be greater than 0."
            );
        }
    }

    // =========================================================
    // EMAIL NORMALIZATION
    // =========================================================

    private String normalizeEmail(String email) {

        if (email == null || email.isBlank()) {

            throw new IllegalArgumentException(
                    "Authenticated user email is required."
            );
        }

        return email
                .trim()
                .toLowerCase(Locale.ROOT);
    }

    // =========================================================
    // SAFE TEXT
    // =========================================================

    private String safeText(String value) {

        return value == null
                ? ""
                : value.trim();
    }

    // =========================================================
    // SCORE VALIDATION
    // =========================================================

    private Integer getRequiredScore(
            JsonNode json,
            String field
    ) {

        if (json == null
                || !json.has(field)
                || json.get(field).isNull()
                || !json.get(field).isIntegralNumber()) {

            throw new IllegalStateException(
                    "AI response is missing a valid score: "
                            + field
            );
        }

        int score =
                json.get(field).asInt();

        if (score < MIN_SCORE
                || score > MAX_SCORE) {

            throw new IllegalStateException(
                    "AI returned an invalid score for: "
                            + field
            );
        }

        return score;
    }

    // =========================================================
    // TEXT VALIDATION
    // =========================================================

    private String getRequiredText(
            JsonNode json,
            String field
    ) {

        if (json == null
                || !json.has(field)
                || json.get(field).isNull()
                || !json.get(field).isTextual()) {

            throw new IllegalStateException(
                    "AI response is missing text field: "
                            + field
            );
        }

        String value =
                json.get(field)
                        .asText()
                        .trim();

        if (value.isBlank()) {

            throw new IllegalStateException(
                    "AI response contains an empty field: "
                            + field
            );
        }

        return value;
    }

    // =========================================================
    // RECOMMENDATION VALIDATION
    // =========================================================

    private void validateRecommendation(
            String recommendation
    ) {

        if (!HIGHLY_RECOMMENDED.equals(recommendation)
                && !RECOMMENDED.equals(recommendation)
                && !MODERATE.equals(recommendation)
                && !NOT_RECOMMENDED.equals(recommendation)) {

            throw new IllegalStateException(
                    "AI returned an invalid recommendation."
            );
        }
    }

    // =========================================================
    // CLEAN AI JSON
    // =========================================================

    private String cleanJsonResponse(
            String response
    ) {

        if (response == null || response.isBlank()) {

            throw new IllegalStateException(
                    "AI response is empty."
            );
        }

        String cleaned =
                response.trim();

        /*
         * Remove Markdown JSON code fences if the AI
         * ignores the prompt and returns them.
         */
        if (cleaned.startsWith("```json")) {

            cleaned =
                    cleaned.substring(7);

        } else if (cleaned.startsWith("```")) {

            cleaned =
                    cleaned.substring(3);
        }

        if (cleaned.endsWith("```")) {

            cleaned =
                    cleaned.substring(
                            0,
                            cleaned.length() - 3
                    );
        }

        cleaned =
                cleaned.trim();

        if (cleaned.isBlank()) {

            throw new IllegalStateException(
                    "AI returned an empty JSON response."
            );
        }

        return cleaned;
    }
}