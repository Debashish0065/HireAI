package com.hireai.hr.service.impl;

import com.hireai.application.entity.Application;
import com.hireai.application.entity.ApplicationStatus;
import com.hireai.application.repository.ApplicationRepository;

import com.hireai.hr.dto.response.HrDashboardResponse;
import com.hireai.hr.service.HrDashboardService;

import com.hireai.job.entity.Job;
import com.hireai.job.enums.JobStatus;
import com.hireai.job.repository.JobRepository;

import com.hireai.user.entity.User;
import com.hireai.user.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@Transactional(readOnly = true)
public class HrDashboardServiceImpl
        implements HrDashboardService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;

    public HrDashboardServiceImpl(
            UserRepository userRepository,
            JobRepository jobRepository,
            ApplicationRepository applicationRepository
    ) {
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
    }

    @Override
    public HrDashboardResponse getDashboard(String email) {

        // ==========================================
        // VALIDATE EMAIL
        // ==========================================

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "HR email is required."
            );
        }

        String normalizedEmail =
                email.trim().toLowerCase(Locale.ROOT);

        // ==========================================
        // FIND LOGGED-IN HR
        // ==========================================

        User hr = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "HR not found"
                        )
                );

        if (hr.getId() == null) {
            throw new IllegalStateException(
                    "HR user ID is not configured."
            );
        }

        // ==========================================
        // JOB STATISTICS
        // ==========================================

        List<Job> jobs =
                jobRepository.findByHrId(hr.getId());

        if (jobs == null) {
            jobs = List.of();
        }

        long totalJobs = jobs.size();

        long openJobs = jobs.stream()
                .filter(job ->
                        job != null
                                && job.getStatus() == JobStatus.OPEN
                )
                .count();

        long closedJobs = jobs.stream()
                .filter(job ->
                        job != null
                                && job.getStatus() == JobStatus.CLOSED
                )
                .count();

        // ==========================================
        // APPLICATION STATISTICS
        // ==========================================

        List<Application> applications =
                applicationRepository.findByJobHr(hr);

        if (applications == null) {
            applications = List.of();
        }

        long totalApplicants = applications.size();

        long applied = applications.stream()
                .filter(application ->
                        application != null
                                && application.getStatus()
                                == ApplicationStatus.APPLIED
                )
                .count();

        long shortlisted = applications.stream()
                .filter(application ->
                        application != null
                                && application.getStatus()
                                == ApplicationStatus.SHORTLISTED
                )
                .count();

        long interview = applications.stream()
                .filter(application ->
                        application != null
                                && application.getStatus()
                                == ApplicationStatus.INTERVIEW
                )
                .count();

        long hired = applications.stream()
                .filter(application ->
                        application != null
                                && application.getStatus()
                                == ApplicationStatus.HIRED
                )
                .count();

        long rejected = applications.stream()
                .filter(application ->
                        application != null
                                && application.getStatus()
                                == ApplicationStatus.REJECTED
                )
                .count();

        // ==========================================
        // BUILD RESPONSE
        // ==========================================

        return HrDashboardResponse.builder()
                .totalJobs(totalJobs)
                .openJobs(openJobs)
                .closedJobs(closedJobs)
                .totalApplicants(totalApplicants)
                .applied(applied)
                .shortlisted(shortlisted)
                .interview(interview)
                .hired(hired)
                .rejected(rejected)
                .build();
    }
}