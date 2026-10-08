package com.hireai.admin.service.impl;

import com.hireai.admin.dto.response.AdminInterviewResponse;
import com.hireai.admin.service.AdminInterviewService;

import com.hireai.interview.entity.Interview;
import com.hireai.interview.enums.InterviewStatus;
import com.hireai.interview.repository.InterviewRepository;

import com.hireai.job.entity.Job;
import com.hireai.user.entity.User;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class AdminInterviewServiceImpl
        implements AdminInterviewService {

    private final InterviewRepository interviewRepository;

    public AdminInterviewServiceImpl(
            InterviewRepository interviewRepository
    ) {
        this.interviewRepository = interviewRepository;
    }

    // =========================================================
    // GET ALL INTERVIEWS
    // =========================================================

    @Override
    public List<AdminInterviewResponse> getAllInterviews() {

        return interviewRepository
                .findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // GET INTERVIEW BY ID
    // =========================================================

    @Override
    public AdminInterviewResponse getInterviewById(
            Long id
    ) {

        validateId(id);

        Interview interview =
                interviewRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Interview not found with id: "
                                                + id
                                )
                        );

        return mapToResponse(interview);
    }

    // =========================================================
    // INTERVIEW STATISTICS
    // =========================================================

    @Override
    public Map<String, Object> getInterviewStatistics() {

        List<Interview> interviews =
                interviewRepository.findAll();

        long total =
                interviews.size();

        long notStarted =
                interviews.stream()
                        .filter(interview ->
                                interview.getStatus()
                                        == InterviewStatus.NOT_STARTED
                        )
                        .count();

        long inProgress =
                interviews.stream()
                        .filter(interview ->
                                interview.getStatus()
                                        == InterviewStatus.IN_PROGRESS
                        )
                        .count();

        long completed =
                interviews.stream()
                        .filter(interview ->
                                interview.getStatus()
                                        == InterviewStatus.COMPLETED
                        )
                        .count();

        long cancelled =
                interviews.stream()
                        .filter(interview ->
                                interview.getStatus()
                                        == InterviewStatus.CANCELLED
                        )
                        .count();

        List<Integer> scores =
                interviews.stream()
                        .filter(interview ->
                                interview.getScore() != null
                        )
                        .map(Interview::getScore)
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

        Map<String, Object> statistics =
                new LinkedHashMap<>();

        statistics.put(
                "total",
                total
        );

        statistics.put(
                "notStarted",
                notStarted
        );

        statistics.put(
                "inProgress",
                inProgress
        );

        statistics.put(
                "completed",
                completed
        );

        statistics.put(
                "cancelled",
                cancelled
        );

        statistics.put(
                "averageScore",
                Math.round(
                        averageScore * 100.0
                ) / 100.0
        );

        statistics.put(
                "highestScore",
                highestScore
        );

        statistics.put(
                "lowestScore",
                lowestScore
        );

        return statistics;
    }

    // =========================================================
    // ENTITY -> RESPONSE
    // =========================================================

    private AdminInterviewResponse mapToResponse(
            Interview interview
    ) {

        User candidate =
                interview.getCandidate();

        Job job =
                interview.getJob();

        // =====================================================
        // CANDIDATE
        // =====================================================

        Long candidateId = null;

        String candidateName = null;

        String candidateEmail = null;

        if (candidate != null) {

            candidateId =
                    candidate.getId();

            candidateEmail =
                    candidate.getEmail();

            String firstName =
                    candidate.getFirstName() != null
                            ? candidate.getFirstName()
                            : "";

            String lastName =
                    candidate.getLastName() != null
                            ? candidate.getLastName()
                            : "";

            candidateName =
                    (firstName + " " + lastName)
                            .trim();

            if (candidateName.isBlank()) {

                candidateName =
                        candidateEmail;
            }
        }

        // =====================================================
        // JOB
        // =====================================================

        Long jobId = null;

        String jobTitle = null;

        String companyName = null;

        if (job != null) {

            jobId =
                    job.getId();

            jobTitle =
                    job.getTitle();

            companyName =
                    job.getCompanyName();
        }

        // =====================================================
        // RESPONSE
        // =====================================================

        return AdminInterviewResponse.builder()

                .id(
                        interview.getId()
                )

                .status(
                        interview.getStatus()
                )

                .totalQuestions(
                        interview.getTotalQuestions()
                )

                .score(
                        interview.getScore()
                )

                .overallFeedback(
                        interview.getOverallFeedback()
                )

                .startedAt(
                        interview.getStartedAt()
                )

                .completedAt(
                        interview.getCompletedAt()
                )

                .candidateId(
                        candidateId
                )

                .candidateName(
                        candidateName
                )

                .candidateEmail(
                        candidateEmail
                )

                .jobId(
                        jobId
                )

                .jobTitle(
                        jobTitle
                )

                .companyName(
                        companyName
                )

                .build();
    }

    // =========================================================
    // ID VALIDATION
    // =========================================================

    private void validateId(Long id) {

        if (id == null || id <= 0) {

            throw new IllegalArgumentException(
                    "Interview id must be a positive number."
            );
        }
    }
}