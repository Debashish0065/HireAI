
package com.hireai.candidate.service.impl;

import com.hireai.application.entity.Application;
import com.hireai.application.entity.ApplicationStatus;
import com.hireai.application.repository.ApplicationRepository;

import com.hireai.candidate.dto.response.CandidateDashboardResponse;
import com.hireai.candidate.service.CandidateDashboardService;

import com.hireai.interview.entity.Interview;
import com.hireai.interview.enums.InterviewStatus;
import com.hireai.interview.repository.InterviewRepository;

import com.hireai.user.entity.User;
import com.hireai.user.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class CandidateDashboardServiceImpl
        implements CandidateDashboardService {

    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;

    public CandidateDashboardServiceImpl(
            UserRepository userRepository,
            ApplicationRepository applicationRepository,
            InterviewRepository interviewRepository
    ) {
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
        this.interviewRepository = interviewRepository;
    }

    @Override
    public CandidateDashboardResponse getDashboard(String email) {

        // =========================================================
        // VALIDATE EMAIL
        // =========================================================

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "Candidate email is required."
            );
        }

        String normalizedEmail = email.trim().toLowerCase();

        // =========================================================
        // FIND CANDIDATE
        // =========================================================

        User candidate = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Candidate not found"
                        )
                );

        // =========================================================
        // APPLICATION STATISTICS
        // =========================================================

        List<Application> applications =
                applicationRepository.findByCandidate(candidate);

        long totalApplications = applications.size();

        long applied = 0;
        long shortlisted = 0;
        long interview = 0;
        long hired = 0;
        long rejected = 0;

        for (Application application : applications) {

            if (application == null ||
                    application.getStatus() == null) {
                continue;
            }

            ApplicationStatus status = application.getStatus();

            switch (status) {
                case APPLIED -> applied++;
                case SHORTLISTED -> shortlisted++;
                case INTERVIEW -> interview++;
                case HIRED -> hired++;
                case REJECTED -> rejected++;
            }
        }

        // =========================================================
        // INTERVIEW STATISTICS
        // =========================================================

        List<Interview> interviews =
                interviewRepository.findByCandidate(candidate);

        long totalInterviews = interviews.size();

        long completedInterviews = interviews.stream()
                .filter(interviewEntity ->
                        interviewEntity != null
                                && interviewEntity.getStatus()
                                == InterviewStatus.COMPLETED
                )
                .count();

        double averageScore = interviews.stream()
                .filter(interviewEntity ->
                        interviewEntity != null
                                && interviewEntity.getScore() != null
                )
                .mapToInt(Interview::getScore)
                .average()
                .orElse(0.0);

        // =========================================================
        // RESPONSE
        // =========================================================

        return CandidateDashboardResponse.builder()
                .totalApplications(totalApplications)
                .applied(applied)
                .shortlisted(shortlisted)
                .interview(interview)
                .hired(hired)
                .rejected(rejected)
                .totalInterviews(totalInterviews)
                .completedInterviews(completedInterviews)
                .averageInterviewScore(
                        Math.round(averageScore * 100.0) / 100.0
                )
                .build();
    }
}