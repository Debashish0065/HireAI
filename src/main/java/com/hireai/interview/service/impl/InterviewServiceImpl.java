package com.hireai.interview.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hireai.interview.dto.request.StartInterviewRequest;
import com.hireai.interview.dto.request.SubmitAnswerRequest;
import com.hireai.interview.dto.response.InterviewQuestionResponse;
import com.hireai.interview.dto.response.InterviewResponse;
import com.hireai.interview.dto.response.InterviewStatisticsResponse;
import com.hireai.interview.entity.Interview;
import com.hireai.interview.entity.InterviewQuestion;
import com.hireai.interview.enums.InterviewStatus;
import com.hireai.interview.enums.QuestionType;
import com.hireai.interview.repository.InterviewQuestionRepository;
import com.hireai.interview.repository.InterviewRepository;
import com.hireai.interview.service.InterviewService;
import com.hireai.job.entity.Job;
import com.hireai.job.repository.JobRepository;
import com.hireai.user.entity.User;
import com.hireai.user.repository.UserRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@Transactional
public class InterviewServiceImpl implements InterviewService {

    private static final int DEFAULT_TOTAL_QUESTIONS = 5;
    private static final int MIN_TOTAL_QUESTIONS = 1;
    private static final int MAX_TOTAL_QUESTIONS = 10;

    private final InterviewRepository interviewRepository;
    private final InterviewQuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    public InterviewServiceImpl(
            InterviewRepository interviewRepository,
            InterviewQuestionRepository questionRepository,
            UserRepository userRepository,
            JobRepository jobRepository,
            ChatClient.Builder chatClientBuilder,
            ObjectMapper objectMapper
    ) {
        this.interviewRepository = interviewRepository;
        this.questionRepository = questionRepository;
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.chatClient = chatClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    // =========================================================
    // START INTERVIEW
    // =========================================================

    @Override
    public InterviewResponse startInterview(
            StartInterviewRequest request,
            String email
    ) {

        if (request == null) {
            throw new IllegalArgumentException("Interview request is required.");
        }

        if (request.getJobId() == null || request.getJobId() <= 0) {
            throw new IllegalArgumentException("Job ID must be greater than 0.");
        }

        String normalizedEmail = normalizeEmail(email);

        User candidate = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException("Candidate not found.")
                );

        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Job not found.")
                );

        int totalQuestions = request.getTotalQuestions() == null
                ? DEFAULT_TOTAL_QUESTIONS
                : request.getTotalQuestions();

        validateQuestionCount(totalQuestions);

        /*
         * Prevent multiple active interviews for the same candidate/job.
         */
        List<Interview> existingInterviews =
                interviewRepository.findByCandidate(candidate);

        boolean activeInterview = existingInterviews.stream()
                .filter(interview -> interview != null)
                .anyMatch(interview ->
                        interview.getJob() != null
                                && interview.getJob().getId() != null
                                && interview.getJob().getId().equals(job.getId())
                                && interview.getStatus() == InterviewStatus.IN_PROGRESS
                );

        if (activeInterview) {
            throw new IllegalStateException(
                    "You already have an active interview for this job."
            );
        }

        /*
         * Only OPEN jobs should allow an interview to start.
         *
         * The JobStatus enum is intentionally not referenced here
         * because the existing job module should remain unchanged
         * until it is audited.
         */

        Interview interview = Interview.builder()
                .candidate(candidate)
                .job(job)
                .status(InterviewStatus.IN_PROGRESS)
                .totalQuestions(totalQuestions)
                .score(0)
                .startedAt(LocalDateTime.now())
                .build();

        Interview savedInterview =
                interviewRepository.save(interview);

        /*
         * Generate questions inside the same transaction.
         * If generation fails, the transaction rolls back and the
         * incomplete interview is not persisted.
         */
        generateQuestions(
                savedInterview,
                job,
                totalQuestions
        );

        return mapToResponse(savedInterview);
    }

    // =========================================================
    // GENERATE AI QUESTIONS
    // =========================================================

    private void generateQuestions(
            Interview interview,
            Job job,
            int totalQuestions
    ) {

        String prompt = """
                You are an expert technical interviewer.

                Generate exactly %d interview questions for the following job.

                JOB TITLE:
                %s

                JOB DESCRIPTION:
                %s

                COMPANY:
                %s

                LOCATION:
                %s

                JOB TYPE:
                %s

                Return ONLY valid JSON.

                Required format:

                {
                  "questions": [
                    {
                      "questionNumber": 1,
                      "question": "Question text",
                      "questionType": "TECHNICAL"
                    }
                  ]
                }

                Allowed questionType values:
                TECHNICAL
                BEHAVIORAL
                HR
                SITUATIONAL

                Requirements:
                - Return exactly %d questions.
                - questionNumber must be sequential from 1 to %d.
                - Every question must be relevant to the job.
                - Do not include answers.
                - Do not include markdown.
                - Do not include any text outside the JSON object.
                """.formatted(
                totalQuestions,
                safeText(job.getTitle()),
                safeText(job.getDescription()),
                safeText(job.getCompanyName()),
                safeText(job.getLocation()),
                job.getJobType() == null
                        ? ""
                        : job.getJobType().name(),
                totalQuestions,
                totalQuestions
        );

        String aiResponse;

        try {
            aiResponse = chatClient
                    .prompt()
                    .user(prompt)
                    .call()
                    .content();
        } catch (Exception e) {
            throw new IllegalStateException(
                    "Unable to generate interview questions using AI.",
                    e
            );
        }

        try {
            JsonNode root =
                    objectMapper.readTree(cleanJson(aiResponse));

            JsonNode questionsNode =
                    root.get("questions");

            if (questionsNode == null || !questionsNode.isArray()) {
                throw new IllegalStateException(
                        "AI returned an invalid question format."
                );
            }

            if (questionsNode.size() != totalQuestions) {
                throw new IllegalStateException(
                        "AI returned "
                                + questionsNode.size()
                                + " questions, but "
                                + totalQuestions
                                + " were required."
                );
            }

            List<InterviewQuestion> questions =
                    new ArrayList<>();

            for (int index = 0;
                 index < questionsNode.size();
                 index++) {

                JsonNode node = questionsNode.get(index);

                if (node == null || !node.isObject()) {
                    throw new IllegalStateException(
                            "AI returned an invalid interview question."
                    );
                }

                String questionText =
                        getRequiredText(node, "question");

                String type =
                        getRequiredText(node, "questionType")
                                .trim()
                                .toUpperCase(Locale.ROOT);

                QuestionType questionType;

                try {
                    questionType =
                            QuestionType.valueOf(type);
                } catch (IllegalArgumentException e) {
                    throw new IllegalStateException(
                            "AI returned an unsupported question type: "
                                    + type
                    );
                }

                int expectedQuestionNumber = index + 1;

                int questionNumber =
                        node.has("questionNumber")
                                && node.get("questionNumber").canConvertToInt()
                                ? node.get("questionNumber").asInt()
                                : expectedQuestionNumber;

                if (questionNumber != expectedQuestionNumber) {
                    throw new IllegalStateException(
                            "AI returned an invalid question number."
                    );
                }

                InterviewQuestion question =
                        InterviewQuestion.builder()
                                .interview(interview)
                                .question(questionText)
                                .questionType(questionType)
                                .questionNumber(questionNumber)
                                .build();

                questions.add(question);
            }

            questionRepository.saveAll(questions);

        } catch (IllegalStateException e) {
            throw e;

        } catch (Exception e) {
            throw new IllegalStateException(
                    "Failed to generate interview questions.",
                    e
            );
        }
    }

    // =========================================================
    // GET MY INTERVIEWS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<InterviewResponse> getMyInterviews(
            String email
    ) {

        String normalizedEmail = normalizeEmail(email);

        User candidate = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException("Candidate not found.")
                );

        return interviewRepository
                .findByCandidate(candidate)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // ADMIN - GET ALL INTERVIEWS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<InterviewResponse> getAllInterviews() {

        return interviewRepository
                .findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // ADMIN - INTERVIEW STATISTICS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public InterviewStatisticsResponse getInterviewStatisticsForAdmin() {

        List<Interview> interviews =
                interviewRepository.findAll();

        long totalInterviews =
                interviews.size();

        long completedInterviews =
                interviews.stream()
                        .filter(interview ->
                                interview != null
                                        && interview.getStatus()
                                        == InterviewStatus.COMPLETED
                        )
                        .count();

        long inProgressInterviews =
                interviews.stream()
                        .filter(interview ->
                                interview != null
                                        && interview.getStatus()
                                        == InterviewStatus.IN_PROGRESS
                        )
                        .count();

        List<Integer> scores =
                interviews.stream()
                        .filter(interview ->
                                interview != null
                                        && interview.getScore() != null
                        )
                        .map(Interview::getScore)
                        .filter(score ->
                                score >= 0 && score <= 100
                        )
                        .toList();

        double averageScore =
                scores.isEmpty()
                        ? 0.0
                        : scores.stream()
                        .mapToInt(Integer::intValue)
                        .average()
                        .orElse(0.0);

        int highestScore =
                scores.isEmpty()
                        ? 0
                        : scores.stream()
                        .mapToInt(Integer::intValue)
                        .max()
                        .orElse(0);

        int lowestScore =
                scores.isEmpty()
                        ? 0
                        : scores.stream()
                        .mapToInt(Integer::intValue)
                        .min()
                        .orElse(0);

        return InterviewStatisticsResponse.builder()
                .totalInterviews(totalInterviews)
                .completedInterviews(completedInterviews)
                .inProgressInterviews(inProgressInterviews)
                .averageScore(
                        Math.round(averageScore * 100.0) / 100.0
                )
                .highestScore(highestScore)
                .lowestScore(lowestScore)
                .build();
    }

    // =========================================================
    // GET MY INTERVIEW BY ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public InterviewResponse getMyInterviewById(
            Long interviewId,
            String email
    ) {

        validateId(interviewId, "Interview ID");

        String normalizedEmail = normalizeEmail(email);

        User candidate = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException("Candidate not found.")
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

        return mapToResponse(interview);
    }

    // =========================================================
    // ADMIN - GET INTERVIEW BY ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public InterviewResponse getInterviewByIdForAdmin(
            Long interviewId
    ) {

        validateId(interviewId, "Interview ID");

        Interview interview =
                interviewRepository
                        .findById(interviewId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Interview not found."
                                )
                        );

        return mapToResponse(interview);
    }

    // =========================================================
    // SUBMIT ANSWER
    // =========================================================

    @Override
    public InterviewResponse submitAnswer(
            SubmitAnswerRequest request,
            String email
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Answer request is required."
            );
        }

        validateId(request.getQuestionId(), "Question ID");

        if (request.getAnswer() == null
                || request.getAnswer().isBlank()) {

            throw new IllegalArgumentException(
                    "Answer cannot be empty."
            );
        }

        String normalizedEmail = normalizeEmail(email);

        User candidate = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Candidate not found."
                        )
                );

        /*
         * Find the question first because the current repository
         * contract provides findByIdAndInterview(), but we don't
         * yet know the interview before loading the question.
         *
         * Ownership is checked immediately after obtaining the
         * interview.
         */
        InterviewQuestion question =
                questionRepository
                        .findById(request.getQuestionId())
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Question not found."
                                )
                        );

        Interview interview = question.getInterview();

        if (interview == null
                || interview.getCandidate() == null
                || interview.getCandidate().getId() == null
                || !interview.getCandidate()
                .getId()
                .equals(candidate.getId())) {

            throw new IllegalArgumentException(
                    "You cannot answer this question."
            );
        }

        if (interview.getStatus()
                != InterviewStatus.IN_PROGRESS) {

            throw new IllegalStateException(
                    "Interview is not in progress."
            );
        }

        /*
         * Do not allow an already answered question to be silently
         * overwritten. This prevents repeated AI calls and score
         * manipulation.
         */
        if (question.getCandidateAnswer() != null
                && !question.getCandidateAnswer().isBlank()) {

            throw new IllegalStateException(
                    "This question has already been answered."
            );
        }

        String answer =
                request.getAnswer().trim();

        question.setCandidateAnswer(answer);

        /*
         * Evaluate the answer using AI.
         * If AI evaluation fails, the transaction rolls back and
         * the answer is not persisted as an evaluated answer.
         */
        evaluateAnswer(question);

        questionRepository.save(question);

        /*
         * Recalculate the current interview score.
         */
        updateInterviewScore(interview);

        interviewRepository.save(interview);

        return mapToResponse(interview);
    }

    // =========================================================
    // AI ANSWER EVALUATION
    // =========================================================

    private void evaluateAnswer(
            InterviewQuestion question
    ) {

        String prompt = """
                You are an expert technical interviewer.

                Evaluate the candidate's answer objectively.

                QUESTION:
                %s

                QUESTION TYPE:
                %s

                CANDIDATE ANSWER:
                %s

                Evaluate:
                - correctness
                - relevance
                - completeness
                - clarity

                Give a score from 0 to 100.

                Return ONLY valid JSON:

                {
                  "score": 85,
                  "feedback": "Brief professional feedback"
                }

                Rules:
                - score must be an integer from 0 to 100.
                - feedback must be concise and professional.
                - do not use markdown.
                - do not include text outside the JSON object.
                """.formatted(
                safeText(question.getQuestion()),
                question.getQuestionType() == null
                        ? ""
                        : question.getQuestionType().name(),
                safeText(question.getCandidateAnswer())
        );

        String aiResponse;

        try {
            aiResponse = chatClient
                    .prompt()
                    .user(prompt)
                    .call()
                    .content();
        } catch (Exception e) {
            throw new IllegalStateException(
                    "Unable to evaluate the interview answer using AI.",
                    e
            );
        }

        try {
            JsonNode root =
                    objectMapper.readTree(
                            cleanJson(aiResponse)
                    );

            JsonNode scoreNode =
                    root.get("score");

            JsonNode feedbackNode =
                    root.get("feedback");

            if (scoreNode == null
                    || !scoreNode.isNumber()) {

                throw new IllegalStateException(
                        "AI returned an invalid answer score."
                );
            }

            if (feedbackNode == null
                    || !feedbackNode.isTextual()) {

                throw new IllegalStateException(
                        "AI returned invalid answer feedback."
                );
            }

            int score =
                    scoreNode.asInt();

            if (score < 0 || score > 100) {
                throw new IllegalStateException(
                        "AI returned an answer score outside 0-100."
                );
            }

            String feedback =
                    feedbackNode.asText().trim();

            if (feedback.isBlank()) {
                throw new IllegalStateException(
                        "AI returned empty answer feedback."
                );
            }

            question.setScore(score);
            question.setFeedback(feedback);

        } catch (IllegalStateException e) {
            throw e;

        } catch (Exception e) {
            throw new IllegalStateException(
                    "Failed to evaluate interview answer.",
                    e
            );
        }
    }

    // =========================================================
    // UPDATE INTERVIEW SCORE
    // =========================================================

    private void updateInterviewScore(
            Interview interview
    ) {

        List<InterviewQuestion> questions =
                questionRepository
                        .findByInterviewOrderByQuestionNumberAsc(
                                interview
                        );

        List<InterviewQuestion> answered =
                questions.stream()
                        .filter(question ->
                                question != null
                                        && question.getScore() != null
                        )
                        .toList();

        if (answered.isEmpty()) {
            interview.setScore(0);
            return;
        }

        int totalScore =
                answered.stream()
                        .mapToInt(
                                InterviewQuestion::getScore
                        )
                        .sum();

        int average =
                Math.round(
                        (float) totalScore / answered.size()
                );

        interview.setScore(
                Math.max(0, Math.min(100, average))
        );
    }

    // =========================================================
    // COMPLETE INTERVIEW
    // =========================================================

    @Override
    public InterviewResponse completeInterview(
            Long interviewId,
            String email
    ) {

        validateId(interviewId, "Interview ID");

        String normalizedEmail = normalizeEmail(email);

        User candidate = userRepository.findByEmail(normalizedEmail)
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

        if (interview.getStatus()
                != InterviewStatus.IN_PROGRESS) {

            throw new IllegalStateException(
                    "Interview is already completed or is not in progress."
            );
        }

        List<InterviewQuestion> questions =
                questionRepository
                        .findByInterviewOrderByQuestionNumberAsc(
                                interview
                        );

        if (questions.isEmpty()) {
            throw new IllegalStateException(
                    "This interview has no questions."
            );
        }

        /*
         * Every question must have an answer.
         */
        boolean allAnswered =
                questions.stream()
                        .allMatch(question ->
                                question != null
                                        && question.getCandidateAnswer() != null
                                        && !question.getCandidateAnswer()
                                        .isBlank()
                        );

        if (!allAnswered) {
            throw new IllegalStateException(
                    "Please answer all interview questions before completing."
            );
        }

        /*
         * Every answered question must also have an AI score.
         */
        boolean allEvaluated =
                questions.stream()
                        .allMatch(question ->
                                question != null
                                        && question.getScore() != null
                        );

        if (!allEvaluated) {
            throw new IllegalStateException(
                    "Some interview answers have not been evaluated yet."
            );
        }

        /*
         * Calculate final score.
         */
        updateInterviewScore(interview);

        /*
         * Generate overall AI feedback.
         */
        generateOverallFeedback(
                interview,
                questions
        );

        /*
         * Complete the interview only after all processing succeeds.
         */
        interview.setStatus(
                InterviewStatus.COMPLETED
        );

        interview.setCompletedAt(
                LocalDateTime.now()
        );

        Interview saved =
                interviewRepository.save(interview);

        return mapToResponse(saved);
    }

    // =========================================================
    // GENERATE OVERALL AI INTERVIEW FEEDBACK
    // =========================================================

    private void generateOverallFeedback(
            Interview interview,
            List<InterviewQuestion> questions
    ) {

        StringBuilder answers =
                new StringBuilder();

        for (InterviewQuestion question : questions) {

            answers.append("""
                    
                    QUESTION:
                    %s
                    
                    QUESTION TYPE:
                    %s
                    
                    CANDIDATE ANSWER:
                    %s
                    
                    SCORE:
                    %s
                    
                    FEEDBACK:
                    %s
                    
                    -------------------------
                    """.formatted(
                    safeText(question.getQuestion()),
                    question.getQuestionType() == null
                            ? ""
                            : question.getQuestionType().name(),
                    safeText(question.getCandidateAnswer()),
                    question.getScore() == null
                            ? "N/A"
                            : question.getScore(),
                    safeText(question.getFeedback())
            ));
        }

        String prompt = """
                You are an expert technical interviewer.

                Analyze the candidate's complete interview performance.

                JOB TITLE:
                %s

                INTERVIEW SCORE:
                %d/100

                INTERVIEW QUESTIONS AND ANSWERS:
                %s

                Generate a concise professional overall interview evaluation.

                Return ONLY valid JSON:

                {
                  "overallFeedback": "Overall evaluation of the candidate's performance."
                }

                Rules:
                - Base the evaluation only on the provided answers.
                - Be professional and realistic.
                - Do not exaggerate.
                - Do not use markdown.
                - Do not include text outside the JSON object.
                """.formatted(
                safeText(interview.getJob().getTitle()),
                interview.getScore() == null
                        ? 0
                        : interview.getScore(),
                answers
        );

        String aiResponse;

        try {
            aiResponse = chatClient
                    .prompt()
                    .user(prompt)
                    .call()
                    .content();
        } catch (Exception e) {
            throw new IllegalStateException(
                    "Unable to generate overall interview feedback using AI.",
                    e
            );
        }

        try {
            JsonNode root =
                    objectMapper.readTree(
                            cleanJson(aiResponse)
                    );

            JsonNode feedbackNode =
                    root.get("overallFeedback");

            if (feedbackNode == null
                    || !feedbackNode.isTextual()) {

                throw new IllegalStateException(
                        "AI returned invalid overall interview feedback."
                );
            }

            String overallFeedback =
                    feedbackNode.asText().trim();

            if (overallFeedback.isBlank()) {
                throw new IllegalStateException(
                        "AI returned empty overall interview feedback."
                );
            }

            interview.setOverallFeedback(
                    overallFeedback
            );

        } catch (IllegalStateException e) {
            throw e;

        } catch (Exception e) {
            throw new IllegalStateException(
                    "Failed to generate overall interview feedback.",
                    e
            );
        }
    }

    // =========================================================
    // ENTITY -> RESPONSE
    // =========================================================

    private InterviewResponse mapToResponse(
            Interview interview
    ) {

        List<InterviewQuestionResponse> questions =
                questionRepository
                        .findByInterviewOrderByQuestionNumberAsc(
                                interview
                        )
                        .stream()
                        .map(question ->
                                InterviewQuestionResponse.builder()
                                        .id(question.getId())
                                        .questionNumber(
                                                question.getQuestionNumber()
                                        )
                                        .question(
                                                question.getQuestion()
                                        )
                                        .questionType(
                                                question.getQuestionType()
                                        )
                                        .candidateAnswer(
                                                question.getCandidateAnswer()
                                        )
                                        .score(
                                                question.getScore()
                                        )
                                        .feedback(
                                                question.getFeedback()
                                        )
                                        .build()
                        )
                        .toList();

        return InterviewResponse.builder()
                .id(interview.getId())
                .jobId(
                        interview.getJob() == null
                                ? null
                                : interview.getJob().getId()
                )
                .jobTitle(
                        interview.getJob() == null
                                ? null
                                : interview.getJob().getTitle()
                )
                .status(interview.getStatus())
                .totalQuestions(
                        interview.getTotalQuestions()
                )
                .score(interview.getScore())
                .overallFeedback(
                        interview.getOverallFeedback()
                )
                .startedAt(
                        interview.getStartedAt()
                )
                .completedAt(
                        interview.getCompletedAt()
                )
                .questions(questions)
                .build();
    }

    // =========================================================
    // CLEAN AI JSON RESPONSE
    // =========================================================

    private String cleanJson(
            String response
    ) {

        if (response == null
                || response.isBlank()) {

            throw new IllegalStateException(
                    "AI returned an empty response."
            );
        }

        String cleaned =
                response.trim();

        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }

        if (cleaned.endsWith("```")) {
            cleaned =
                    cleaned.substring(
                            0,
                            cleaned.length() - 3
                    );
        }

        cleaned = cleaned.trim();

        if (cleaned.isBlank()) {
            throw new IllegalStateException(
                    "AI returned an empty JSON response."
            );
        }

        return cleaned;
    }

    // =========================================================
    // VALIDATION HELPERS
    // =========================================================

    private void validateQuestionCount(
            int totalQuestions
    ) {

        if (totalQuestions < MIN_TOTAL_QUESTIONS
                || totalQuestions > MAX_TOTAL_QUESTIONS) {

            throw new IllegalArgumentException(
                    "Total questions must be between "
                            + MIN_TOTAL_QUESTIONS
                            + " and "
                            + MAX_TOTAL_QUESTIONS
                            + "."
            );
        }
    }

    private void validateId(
            Long id,
            String fieldName
    ) {

        if (id == null || id <= 0) {
            throw new IllegalArgumentException(
                    fieldName + " must be greater than 0."
            );
        }
    }

    private String normalizeEmail(
            String email
    ) {

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "Authenticated user email is required."
            );
        }

        return email.trim()
                .toLowerCase(Locale.ROOT);
    }

    private String safeText(
            String value
    ) {

        return value == null
                ? ""
                : value.trim();
    }

    private String getRequiredText(
            JsonNode node,
            String fieldName
    ) {

        JsonNode field =
                node.get(fieldName);

        if (field == null
                || !field.isTextual()
                || field.asText().isBlank()) {

            throw new IllegalStateException(
                    "AI response is missing required field: "
                            + fieldName
            );
        }

        return field.asText().trim();
    }
}