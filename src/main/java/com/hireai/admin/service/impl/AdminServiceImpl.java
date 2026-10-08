package com.hireai.admin.service.impl;

import com.hireai.admin.dto.response.AdminDashboardResponse;
import com.hireai.admin.dto.response.AdminUserResponse;
import com.hireai.admin.service.AdminService;

import com.hireai.application.entity.Application;
import com.hireai.application.entity.ApplicationStatus;
import com.hireai.application.repository.ApplicationRepository;

import com.hireai.job.entity.Job;
import com.hireai.job.enums.JobStatus;
import com.hireai.job.repository.JobRepository;

import com.hireai.match.entity.JobMatch;
import com.hireai.match.repository.JobMatchRepository;

import com.hireai.resume.entity.Resume;
import com.hireai.resume.repository.ResumeRepository;

import com.hireai.user.entity.User;
import com.hireai.user.enums.Role;
import com.hireai.user.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final ResumeRepository resumeRepository;
    private final JobMatchRepository jobMatchRepository;

    public AdminServiceImpl(
            UserRepository userRepository,
            JobRepository jobRepository,
            ApplicationRepository applicationRepository,
            ResumeRepository resumeRepository,
            JobMatchRepository jobMatchRepository
    ) {
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.resumeRepository = resumeRepository;
        this.jobMatchRepository = jobMatchRepository;
    }

    // =========================================================
    // ADMIN DASHBOARD
    // =========================================================

    @Override
    public AdminDashboardResponse getDashboard() {

        // =====================================================
        // USERS
        // =====================================================

        List<User> users = userRepository.findAll();

        long totalUsers = users.size();

        long totalCandidates = users.stream()
                .filter(user -> user.getRole() == Role.CANDIDATE)
                .count();

        long totalHR = users.stream()
                .filter(user -> user.getRole() == Role.HR)
                .count();

        long totalAdmins = users.stream()
                .filter(user -> user.getRole() == Role.ADMIN)
                .count();

        // =====================================================
        // JOBS
        // =====================================================

        List<Job> jobs = jobRepository.findAll();

        long totalJobs = jobs.size();

        long openJobs = jobs.stream()
                .filter(job -> job.getStatus() == JobStatus.OPEN)
                .count();

        long closedJobs = jobs.stream()
                .filter(job -> job.getStatus() == JobStatus.CLOSED)
                .count();

        // =====================================================
        // APPLICATIONS
        // =====================================================

        List<Application> applications = applicationRepository.findAll();

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
        // RESUMES
        // =====================================================

        long totalResumes = resumeRepository.count();

        // =====================================================
        // AI JOB MATCHES
        // =====================================================

        long totalJobMatches = jobMatchRepository.count();

        // =====================================================
        // AVERAGE AI MATCH SCORE
        // =====================================================

        double averageMatchScore = calculateAverageMatchScore(
                jobMatchRepository.findAll()
        );

        // =====================================================
        // RETURN DASHBOARD
        // =====================================================

        return AdminDashboardResponse.builder()

                // USERS
                .totalUsers(totalUsers)
                .totalCandidates(totalCandidates)
                .totalHR(totalHR)
                .totalAdmins(totalAdmins)

                // JOBS
                .totalJobs(totalJobs)
                .openJobs(openJobs)
                .closedJobs(closedJobs)

                // APPLICATIONS
                .totalApplications(totalApplications)
                .appliedApplications(appliedApplications)
                .shortlistedApplications(shortlistedApplications)
                .interviewApplications(interviewApplications)
                .hiredApplications(hiredApplications)
                .rejectedApplications(rejectedApplications)

                // RESUMES
                .totalResumes(totalResumes)

                // AI MATCHING
                .totalJobMatches(totalJobMatches)
                .averageMatchScore(
                        roundToTwoDecimals(averageMatchScore)
                )

                .build();
    }

    // =========================================================
    // GET ALL USERS
    // =========================================================

    @Override
    public List<AdminUserResponse> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // GET USER BY ID
    // =========================================================

    @Override
    public AdminUserResponse getUserById(Long id) {

        validateId(id);

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found with id: " + id
                        )
                );

        return mapToResponse(user);
    }

    // =========================================================
    // DELETE USER
    // =========================================================

    @Override
    @Transactional
    public void deleteUser(Long id) {

        validateId(id);

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found with id: " + id
                        )
                );

        // -----------------------------------------------------
        // Prevent deleting ADMIN
        // -----------------------------------------------------

        if (user.getRole() == Role.ADMIN) {
            throw new IllegalStateException(
                    "Admin users cannot be deleted."
            );
        }

        userRepository.delete(user);
    }

    // =========================================================
    // COUNT APPLICATIONS BY STATUS
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
    // CALCULATE AVERAGE MATCH SCORE
    // =========================================================

    private double calculateAverageMatchScore(
            List<JobMatch> jobMatches
    ) {

        if (jobMatches == null || jobMatches.isEmpty()) {
            return 0.0;
        }

        return jobMatches.stream()
                .map(JobMatch::getMatchScore)
                .filter(score -> score != null)
                .mapToInt(Integer::intValue)
                .average()
                .orElse(0.0);
    }

    // =========================================================
    // ROUND DECIMAL VALUE
    // =========================================================

    private double roundToTwoDecimals(double value) {

        return Math.round(value * 100.0) / 100.0;
    }

    // =========================================================
    // VALIDATE ID
    // =========================================================

    private void validateId(Long id) {

        if (id == null || id <= 0) {
            throw new IllegalArgumentException(
                    "User id must be a positive number."
            );
        }
    }

    // =========================================================
    // ENTITY -> RESPONSE
    // =========================================================

    private AdminUserResponse mapToResponse(User user) {

        return AdminUserResponse.builder()

                .id(user.getId())

                .firstName(user.getFirstName())

                .lastName(user.getLastName())

                .email(user.getEmail())

                .role(
                        user.getRole() != null
                                ? user.getRole().name()
                                : null
                )

                .phone(user.getPhone())

                .location(user.getLocation())

                .headline(user.getHeadline())

                .experience(user.getExperience())

                .createdAt(user.getCreatedAt())

                .build();
    }
}