package com.hireai.application.service.impl;

import com.hireai.application.dto.request.ApplyJobRequest;
import com.hireai.application.dto.request.UpdateApplicationStatusRequest;
import com.hireai.application.dto.response.ApplicationResponse;
import com.hireai.application.entity.Application;
import com.hireai.application.entity.ApplicationStatus;
import com.hireai.application.repository.ApplicationRepository;
import com.hireai.application.service.ApplicationService;
import com.hireai.job.entity.Job;
import com.hireai.job.enums.JobStatus;
import com.hireai.job.repository.JobRepository;
import com.hireai.notification.dto.request.NotificationRequest;
import com.hireai.notification.enums.NotificationType;
import com.hireai.notification.service.NotificationService;
import com.hireai.user.entity.User;
import com.hireai.user.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final NotificationService notificationService;

    public ApplicationServiceImpl(
            ApplicationRepository applicationRepository,
            UserRepository userRepository,
            JobRepository jobRepository,
            NotificationService notificationService
    ) {
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.notificationService = notificationService;
    }

    // =========================================================
    // CANDIDATE - APPLY FOR JOB
    // =========================================================

    @Override
    @Transactional
    public ApplicationResponse applyJob(
            ApplyJobRequest request,
            String email
    ) {

        validateEmail(email);

        if (request == null) {
            throw new IllegalArgumentException(
                    "Application request is required."
            );
        }

        if (request.getJobId() == null || request.getJobId() <= 0) {
            throw new IllegalArgumentException(
                    "Valid job ID is required."
            );
        }

        User candidate = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Candidate not found")
                );

        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() ->
                        new RuntimeException("Job not found")
                );

        // =====================================================
        // CHECK JOB STATUS
        // =====================================================

        if (job.getStatus() != JobStatus.OPEN) {
            throw new RuntimeException(
                    "You cannot apply for a closed job."
            );
        }

        // =====================================================
        // CHECK DUPLICATE APPLICATION
        // =====================================================

        if (applicationRepository.existsByCandidateAndJob(
                candidate,
                job
        )) {
            throw new RuntimeException(
                    "You have already applied for this job."
            );
        }

        // =====================================================
        // CREATE APPLICATION
        // =====================================================

        Application application = Application.builder()
                .candidate(candidate)
                .job(job)
                .status(ApplicationStatus.APPLIED)
                .build();

        Application saved =
                applicationRepository.save(application);

        // =====================================================
        // NOTIFICATION FOR CANDIDATE
        // =====================================================

        NotificationRequest candidateNotification =
                NotificationRequest.builder()
                        .userId(candidate.getId())
                        .title("Application Submitted")
                        .message(
                                "Your application for "
                                        + job.getTitle()
                                        + " has been submitted successfully."
                        )
                        .type(
                                NotificationType.APPLICATION_SUBMITTED
                        )
                        .build();

        notificationService.createNotification(
                candidateNotification
        );

        // =====================================================
        // NOTIFICATION FOR HR
        // =====================================================

        if (job.getHr() != null) {

            User hr = job.getHr();

            String candidateName =
                    buildFullName(
                            candidate.getFirstName(),
                            candidate.getLastName()
                    );

            NotificationRequest hrNotification =
                    NotificationRequest.builder()
                            .userId(hr.getId())
                            .title("New Job Application")
                            .message(
                                    candidateName
                                            + " has applied for your job: "
                                            + job.getTitle()
                            )
                            .type(
                                    NotificationType.NEW_APPLICATION
                            )
                            .build();

            notificationService.createNotification(
                    hrNotification
            );
        }

        return mapToResponse(saved);
    }

    // =========================================================
    // CANDIDATE - MY APPLICATIONS
    // =========================================================

    @Override
    public List<ApplicationResponse> getMyApplications(
            String email
    ) {

        validateEmail(email);

        User candidate = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Candidate not found")
                );

        List<Application> applications =
                applicationRepository.findByCandidate(candidate);

        return applications.stream()
                .sorted(this::compareByAppliedAtDescending)
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // CANDIDATE - GET APPLICATION BY ID
    // =========================================================

    @Override
    public ApplicationResponse getMyApplicationById(
            Long applicationId,
            String email
    ) {

        validateEmail(email);
        validateId(applicationId, "Application ID");

        User candidate = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Candidate not found")
                );

        Application application =
                applicationRepository
                        .findByIdAndCandidate(
                                applicationId,
                                candidate
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Application not found"
                                )
                        );

        return mapToResponse(application);
    }

    // =========================================================
    // CANDIDATE - WITHDRAW APPLICATION
    // =========================================================

    @Override
    @Transactional
    public void withdrawApplication(
            Long applicationId,
            String email
    ) {

        validateEmail(email);
        validateId(applicationId, "Application ID");

        User candidate = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Candidate not found")
                );

        Application application =
                applicationRepository
                        .findByIdAndCandidate(
                                applicationId,
                                candidate
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Application not found"
                                )
                        );

        ApplicationStatus currentStatus =
                application.getStatus();

        if (currentStatus == ApplicationStatus.HIRED) {
            throw new RuntimeException(
                    "You cannot withdraw a hired application."
            );
        }

        if (currentStatus == ApplicationStatus.REJECTED) {
            throw new RuntimeException(
                    "You cannot withdraw a rejected application."
            );
        }

        applicationRepository.delete(application);
    }

    // =========================================================
    // HR - GET ALL APPLICANTS
    // =========================================================

    @Override
    public List<ApplicationResponse> getApplicantsForHR(
            String email
    ) {

        validateEmail(email);

        User hr = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("HR not found")
                );

        List<Application> applications =
                applicationRepository.findByJobHr(hr);

        return applications.stream()
                .sorted(this::compareByAppliedAtDescending)
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // HR - GET APPLICANTS FOR SPECIFIC JOB
    // =========================================================

    @Override
    public List<ApplicationResponse> getApplicantsForHRJob(
            Long jobId,
            String email
    ) {

        validateEmail(email);
        validateId(jobId, "Job ID");

        User hr = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("HR not found")
                );

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Job not found with id: " + jobId
                        )
                );

        // =====================================================
        // CHECK JOB OWNERSHIP
        // =====================================================

        if (job.getHr() == null
                || job.getHr().getId() == null
                || !job.getHr().getId().equals(hr.getId())) {

            throw new RuntimeException(
                    "You are not authorized to view applicants for this job."
            );
        }

        // =====================================================
        // GET APPLICATIONS
        //
        // Keep this query because it is already part of the
        // repository contract and existing unit tests.
        // Ownership was verified above.
        // =====================================================

        List<Application> applications =
                applicationRepository.findByJob(job);

        return applications.stream()
                .sorted(this::compareByAppliedAtDescending)
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // HR - UPDATE APPLICATION STATUS
    // =========================================================

    @Override
    @Transactional
    public ApplicationResponse updateStatus(
            Long applicationId,
            UpdateApplicationStatusRequest request,
            String email
    ) {

        validateEmail(email);
        validateId(applicationId, "Application ID");

        if (request == null) {
            throw new IllegalArgumentException(
                    "Application status is required."
            );
        }

        if (request.getStatus() == null
                || request.getStatus().isBlank()) {

            throw new IllegalArgumentException(
                    "Application status is required."
            );
        }

        User hr = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("HR not found")
                );

        Application application =
                applicationRepository
                        .findById(applicationId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Application not found with id: "
                                                + applicationId
                                )
                        );

        // =====================================================
        // CHECK APPLICATION JOB OWNERSHIP
        // =====================================================

        Job job = application.getJob();

        if (job == null
                || job.getHr() == null
                || job.getHr().getId() == null
                || !job.getHr().getId().equals(hr.getId())) {

            throw new RuntimeException(
                    "You cannot update this application."
            );
        }

        // =====================================================
        // CONVERT STATUS
        // =====================================================

        ApplicationStatus newStatus;

        try {

            newStatus = ApplicationStatus.valueOf(
                    request.getStatus()
                            .trim()
                            .toUpperCase()
            );

        } catch (IllegalArgumentException e) {

            throw new IllegalArgumentException(
                    "Invalid status. Allowed values: "
                            + "APPLIED, SHORTLISTED, INTERVIEW, "
                            + "HIRED, REJECTED"
            );
        }

        // =====================================================
        // CHECK WHETHER STATUS ACTUALLY CHANGED
        // =====================================================

        ApplicationStatus oldStatus =
                application.getStatus();

        if (oldStatus == newStatus) {
            return mapToResponse(application);
        }

        // =====================================================
        // UPDATE STATUS
        // =====================================================

        application.setStatus(newStatus);

        Application saved =
                applicationRepository.save(application);

        // =====================================================
        // SEND CANDIDATE NOTIFICATION
        // =====================================================

        sendStatusNotification(
                saved,
                newStatus
        );

        return mapToResponse(saved);
    }

    // =========================================================
    // CANDIDATE - CHECK IF ALREADY APPLIED
    // =========================================================

    @Override
    public boolean hasApplied(
            Long jobId,
            String email
    ) {

        validateEmail(email);
        validateId(jobId, "Job ID");

        User candidate = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Candidate not found")
                );

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() ->
                        new RuntimeException("Job not found")
                );

        return applicationRepository.existsByCandidateAndJob(
                candidate,
                job
        );
    }

    // =========================================================
    // SEND STATUS NOTIFICATION
    // =========================================================

    private void sendStatusNotification(
            Application application,
            ApplicationStatus newStatus
    ) {

        User candidate = application.getCandidate();
        Job job = application.getJob();

        if (candidate == null || job == null) {
            return;
        }

        NotificationType notificationType = null;
        String title = null;
        String message = null;

        switch (newStatus) {

            case SHORTLISTED:

                notificationType =
                        NotificationType.APPLICATION_SHORTLISTED;

                title = "Application Shortlisted";

                message =
                        "Your application for "
                                + job.getTitle()
                                + " has been shortlisted.";

                break;

            case INTERVIEW:

                notificationType =
                        NotificationType.INTERVIEW_SCHEDULED;

                title = "Interview Scheduled";

                message =
                        "Your application for "
                                + job.getTitle()
                                + " has moved to the interview stage.";

                break;

            case HIRED:

                notificationType =
                        NotificationType.APPLICATION_SELECTED;

                title = "Application Selected";

                message =
                        "Congratulations! You have been selected for "
                                + job.getTitle()
                                + ".";

                break;

            case REJECTED:

                notificationType =
                        NotificationType.APPLICATION_REJECTED;

                title = "Application Rejected";

                message =
                        "Unfortunately, your application for "
                                + job.getTitle()
                                + " was not selected.";

                break;

            case APPLIED:
                // Application submission already sends
                // APPLICATION_SUBMITTED notification.
                break;

            default:
                break;
        }

        if (notificationType == null) {
            return;
        }

        NotificationRequest notificationRequest =
                NotificationRequest.builder()
                        .userId(candidate.getId())
                        .title(title)
                        .message(message)
                        .type(notificationType)
                        .build();

        notificationService.createNotification(
                notificationRequest
        );
    }

    // =========================================================
    // ENTITY -> RESPONSE DTO
    // =========================================================

    private ApplicationResponse mapToResponse(
            Application application
    ) {

        if (application == null) {
            throw new IllegalArgumentException(
                    "Application cannot be null."
            );
        }

        User candidate =
                application.getCandidate();

        Job job =
                application.getJob();

        if (candidate == null) {
            throw new RuntimeException(
                    "Application candidate information is missing."
            );
        }

        if (job == null) {
            throw new RuntimeException(
                    "Application job information is missing."
            );
        }

        return ApplicationResponse.builder()
                .id(application.getId())
                .jobId(job.getId())
                .jobTitle(job.getTitle())
                .companyName(job.getCompanyName())
                .candidateName(
                        buildFullName(
                                candidate.getFirstName(),
                                candidate.getLastName()
                        )
                )
                .candidateEmail(
                        candidate.getEmail()
                )
                .status(
                        application.getStatus() != null
                                ? application.getStatus().name()
                                : null
                )
                .appliedAt(
                        application.getAppliedAt()
                )
                .build();
    }

    // =========================================================
    // SORT APPLICATIONS BY DATE - NEWEST FIRST
    // =========================================================

    private int compareByAppliedAtDescending(
            Application first,
            Application second
    ) {

        if (first.getAppliedAt() == null
                && second.getAppliedAt() == null) {
            return 0;
        }

        if (first.getAppliedAt() == null) {
            return 1;
        }

        if (second.getAppliedAt() == null) {
            return -1;
        }

        return second.getAppliedAt()
                .compareTo(first.getAppliedAt());
    }

    // =========================================================
    // VALIDATION HELPERS
    // =========================================================

    private void validateEmail(String email) {

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "User email is required."
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

    private String buildFullName(
            String firstName,
            String lastName
    ) {

        String first =
                firstName != null
                        ? firstName.trim()
                        : "";

        String last =
                lastName != null
                        ? lastName.trim()
                        : "";

        String fullName =
                (first + " " + last).trim();

        return fullName.isBlank()
                ? "Candidate"
                : fullName;
    }
}