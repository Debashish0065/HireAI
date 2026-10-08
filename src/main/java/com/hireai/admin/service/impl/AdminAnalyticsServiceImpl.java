package com.hireai.admin.service.impl;

import com.hireai.admin.dto.response.AdminAnalyticsResponse;
import com.hireai.admin.service.AdminAnalyticsService;
import com.hireai.application.entity.Application;
import com.hireai.application.entity.ApplicationStatus;
import com.hireai.application.repository.ApplicationRepository;
import com.hireai.job.entity.Job;
import com.hireai.job.enums.JobStatus;
import com.hireai.job.repository.JobRepository;
import com.hireai.match.entity.JobMatch;
import com.hireai.match.repository.JobMatchRepository;
import com.hireai.user.entity.User;
import com.hireai.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class AdminAnalyticsServiceImpl implements AdminAnalyticsService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final JobMatchRepository jobMatchRepository;

    public AdminAnalyticsServiceImpl(
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
    // GET ADMIN ANALYTICS
    // =========================================================

    @Override
    public AdminAnalyticsResponse getAnalytics() {

        // =====================================================
        // USERS
        // =====================================================

        List<User> users = userRepository.findAll();

        long totalUsers = users.size();

        long totalCandidates = users.stream()
                .filter(user ->
                        user.getRole() != null
                                && "CANDIDATE".equalsIgnoreCase(
                                user.getRole().name()
                        )
                )
                .count();

        long totalHRs = users.stream()
                .filter(user ->
                        user.getRole() != null
                                && "HR".equalsIgnoreCase(
                                user.getRole().name()
                        )
                )
                .count();

        long totalAdmins = users.stream()
                .filter(user ->
                        user.getRole() != null
                                && "ADMIN".equalsIgnoreCase(
                                user.getRole().name()
                        )
                )
                .count();

        // =====================================================
        // JOBS
        // =====================================================

        List<Job> jobs = jobRepository.findAll();

        long totalJobs = jobs.size();

        long openJobs = jobs.stream()
                .filter(job ->
                        job.getStatus() == JobStatus.OPEN
                )
                .count();

        long closedJobs = jobs.stream()
                .filter(job ->
                        job.getStatus() == JobStatus.CLOSED
                )
                .count();

        // =====================================================
        // APPLICATIONS
        // =====================================================

        List<Application> applications =
                applicationRepository.findAll();

        long totalApplications = applications.size();

        long appliedApplications = countApplications(
                applications,
                ApplicationStatus.APPLIED
        );

        long shortlistedApplications = countApplications(
                applications,
                ApplicationStatus.SHORTLISTED
        );

        long interviewApplications = countApplications(
                applications,
                ApplicationStatus.INTERVIEW
        );

        long hiredApplications = countApplications(
                applications,
                ApplicationStatus.HIRED
        );

        long rejectedApplications = countApplications(
                applications,
                ApplicationStatus.REJECTED
        );

        // =====================================================
        // JOB MATCHES
        // =====================================================

        List<JobMatch> matches =
                jobMatchRepository.findAll();

        long totalJobMatches = matches.size();

        double averageMatchScore =
                calculateAverageMatchScore(matches);

        // =====================================================
        // INTERVIEW / NOTIFICATION STATISTICS
        // =====================================================
        //
        // These remain 0 for this step because this service
        // currently does not have InterviewRepository or
        // NotificationRepository dependencies.
        //
        // We will implement these after inspecting the actual
        // repositories and entities.
        // =====================================================

        long totalInterviews = 0;
        long completedInterviews = 0;
        long totalNotifications = 0;
        long unreadNotifications = 0;

        // =====================================================
        // RESPONSE
        // =====================================================

        return AdminAnalyticsResponse.builder()

                // Users
                .totalUsers(totalUsers)
                .totalCandidates(totalCandidates)
                .totalHRs(totalHRs)
                .totalAdmins(totalAdmins)

                // Jobs
                .totalJobs(totalJobs)
                .openJobs(openJobs)
                .closedJobs(closedJobs)

                // Applications
                .totalApplications(totalApplications)
                .appliedApplications(appliedApplications)
                .shortlistedApplications(shortlistedApplications)
                .interviewApplications(interviewApplications)
                .hiredApplications(hiredApplications)
                .rejectedApplications(rejectedApplications)

                // AI matching
                .totalJobMatches(totalJobMatches)
                .averageMatchScore(averageMatchScore)

                // Interview / Notification
                .totalInterviews(totalInterviews)
                .completedInterviews(completedInterviews)
                .totalNotifications(totalNotifications)
                .unreadNotifications(unreadNotifications)

                .build();
    }

    // =========================================================
    // COUNT APPLICATION STATUS
    // =========================================================

    private long countApplications(
            List<Application> applications,
            ApplicationStatus status
    ) {
        return applications.stream()
                .filter(application ->
                        application.getStatus() == status
                )
                .count();
    }

    // =========================================================
    // AVERAGE AI MATCH SCORE
    // =========================================================

    private double calculateAverageMatchScore(
            List<JobMatch> matches
    ) {

        if (matches == null || matches.isEmpty()) {
            return 0.0;
        }

        double total = 0.0;
        long count = 0;

        for (JobMatch match : matches) {

            if (match == null || match.getMatchScore() == null) {
                continue;
            }

            total += match.getMatchScore();
            count++;
        }

        if (count == 0) {
            return 0.0;
        }

        return Math.round(
                (total / count) * 100.0
        ) / 100.0;
    }
}