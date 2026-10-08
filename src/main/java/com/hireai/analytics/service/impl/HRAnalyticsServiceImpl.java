package com.hireai.analytics.service.impl;

import com.hireai.analytics.dto.response.HRAnalyticsResponse;
import com.hireai.analytics.service.HRAnalyticsService;
import com.hireai.application.entity.Application;
import com.hireai.application.entity.ApplicationStatus;
import com.hireai.application.repository.ApplicationRepository;
import com.hireai.job.entity.Job;
import com.hireai.job.repository.JobRepository;
import com.hireai.match.entity.JobMatch;
import com.hireai.match.repository.JobMatchRepository;
import com.hireai.user.entity.User;
import com.hireai.user.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional(readOnly = true)
public class HRAnalyticsServiceImpl implements HRAnalyticsService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final JobMatchRepository jobMatchRepository;

    public HRAnalyticsServiceImpl(
            UserRepository userRepository,
            JobRepository jobRepository,
            ApplicationRepository applicationRepository,
            JobMatchRepository jobMatchRepository
    ) {
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.jobMatchRepository = jobMatchRepository;
    }

    // =========================================================
    // HR DASHBOARD ANALYTICS
    // =========================================================

    @Override
    public HRAnalyticsResponse getDashboardAnalytics(String email) {

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "HR email must not be empty"
            );
        }

        String normalizedEmail = email.trim();

        // -----------------------------------------------------
        // FIND LOGGED-IN HR
        // -----------------------------------------------------

        User hr = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "HR user not found"
                        )
                );

        // -----------------------------------------------------
        // GET HR JOBS
        // -----------------------------------------------------

        List<Job> jobs = jobRepository.findByHrId(hr.getId());

        long totalJobs = jobs.size();

        // -----------------------------------------------------
        // GET ALL APPLICATIONS FOR HR
        // -----------------------------------------------------

        List<Application> applications =
                applicationRepository.findByJobHr(hr);

        long totalApplications = applications.size();

        // -----------------------------------------------------
        // APPLICATION STATUS COUNTS
        // -----------------------------------------------------

        long pendingApplications = applications.stream()
                .filter(application ->
                        application.getStatus() == ApplicationStatus.APPLIED
                )
                .count();

        long shortlistedApplications = applications.stream()
                .filter(application ->
                        application.getStatus() == ApplicationStatus.SHORTLISTED
                )
                .count();

        long interviewedApplications = applications.stream()
                .filter(application ->
                        application.getStatus() == ApplicationStatus.INTERVIEW
                )
                .count();

        long selectedApplications = applications.stream()
                .filter(application ->
                        application.getStatus() == ApplicationStatus.HIRED
                )
                .count();

        long rejectedApplications = applications.stream()
                .filter(application ->
                        application.getStatus() == ApplicationStatus.REJECTED
                )
                .count();

        // -----------------------------------------------------
        // UNIQUE CANDIDATES
        // -----------------------------------------------------

        Set<Long> candidateIds = new HashSet<>();

        for (Application application : applications) {

            if (application.getCandidate() != null
                    && application.getCandidate().getId() != null) {

                candidateIds.add(
                        application.getCandidate().getId()
                );
            }
        }

        long totalCandidates = candidateIds.size();

        // -----------------------------------------------------
        // AI MATCH SCORE
        // -----------------------------------------------------

        double averageMatchScore =
                calculateAverageMatchScore(jobs);

        // -----------------------------------------------------
        // INTERVIEW SUCCESS RATE
        // -----------------------------------------------------

        double interviewSuccessRate =
                calculateInterviewSuccessRate(
                        interviewedApplications,
                        selectedApplications
                );

        // -----------------------------------------------------
        // BUILD RESPONSE
        // -----------------------------------------------------

        return HRAnalyticsResponse.builder()
                .totalJobs(totalJobs)
                .totalApplications(totalApplications)
                .pendingApplications(pendingApplications)
                .shortlistedApplications(shortlistedApplications)
                .interviewedApplications(interviewedApplications)
                .selectedApplications(selectedApplications)
                .rejectedApplications(rejectedApplications)
                .totalCandidates(totalCandidates)
                .averageMatchScore(averageMatchScore)
                .interviewSuccessRate(interviewSuccessRate)
                .build();
    }

    // =========================================================
    // CALCULATE AVERAGE AI MATCH SCORE
    // =========================================================

    private double calculateAverageMatchScore(
            List<Job> jobs
    ) {

        if (jobs == null || jobs.isEmpty()) {
            return 0.0;
        }

        double totalScore = 0.0;
        long totalMatches = 0;

        for (Job job : jobs) {

            List<JobMatch> matches =
                    jobMatchRepository.findByJob(job);

            for (JobMatch match : matches) {

                if (match.getMatchScore() != null) {

                    totalScore += match.getMatchScore();
                    totalMatches++;
                }
            }
        }

        if (totalMatches == 0) {
            return 0.0;
        }

        return Math.round(
                (totalScore / totalMatches) * 100.0
        ) / 100.0;
    }

    // =========================================================
    // INTERVIEW SUCCESS RATE
    // =========================================================

    private double calculateInterviewSuccessRate(
            long interviewedApplications,
            long selectedApplications
    ) {

        if (interviewedApplications <= 0) {
            return 0.0;
        }

        double rate =
                ((double) selectedApplications
                        / interviewedApplications)
                        * 100.0;

        return Math.round(rate * 100.0) / 100.0;
    }
}