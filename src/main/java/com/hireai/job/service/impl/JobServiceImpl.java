package com.hireai.job.service.impl;

import com.hireai.application.repository.ApplicationRepository;
import com.hireai.job.dto.request.CreateJobRequest;
import com.hireai.job.dto.response.JobResponse;
import com.hireai.job.entity.Job;
import com.hireai.job.enums.JobStatus;
import com.hireai.job.repository.JobRepository;
import com.hireai.job.service.JobService;
import com.hireai.user.entity.User;
import com.hireai.user.repository.UserRepository;

import org.springframework.transaction.annotation.Transactional;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;

    private final UserRepository userRepository;

    private final ApplicationRepository applicationRepository;

    public JobServiceImpl(
            JobRepository jobRepository,
            UserRepository userRepository,
            ApplicationRepository applicationRepository
    ) {
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
    }

    // =========================================================
    // CREATE JOB
    // =========================================================

    @Override
    @Transactional
    public JobResponse createJob(
            CreateJobRequest request,
            String email
    ) {

        String normalizedEmail = normalizeEmail(email);

        /*
         * Find the authenticated HR user first.
         * This preserves the expected "User not found"
         * behavior when the HR account does not exist.
         */
        User hr = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found")
                );

        validateRequest(request);

        Job job = Job.builder()
                .title(request.getTitle().trim())
                .description(request.getDescription().trim())
                .companyName(request.getCompanyName().trim())
                .location(request.getLocation().trim())
                .salary(request.getSalary())
                .jobType(request.getJobType())
                .status(JobStatus.OPEN)
                .hr(hr)
                .build();

        Job savedJob = jobRepository.save(job);

        return mapToResponse(savedJob);
    }

    // =========================================================
    // GET ALL JOBS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<JobResponse> getAllJobs() {

        /*
         * Keep findAll() because the current API contract and
         * existing tests expect all jobs to be returned.
         */
        return jobRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // GET SINGLE JOB
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public JobResponse getJobById(Long id) {

        validateId(id);

        Job job = jobRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Job not found")
                );

        return mapToResponse(job);
    }

    // =========================================================
    // UPDATE JOB
    // =========================================================

    @Override
    @Transactional
    public JobResponse updateJob(
            Long id,
            CreateJobRequest request,
            String email
    ) {

        validateId(id);

        /*
         * Find the job before validating the request.
         * This preserves the expected "Job not found" response.
         */
        Job job = jobRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Job not found")
                );

        String normalizedEmail = normalizeEmail(email);

        /*
         * Ownership must be checked before request validation.
         * This preserves the expected authorization behavior.
         */
        validateOwnership(
                job,
                normalizedEmail,
                "You cannot update this job"
        );

        validateRequest(request);

        /*
         * Closed jobs cannot be modified through the normal
         * update endpoint.
         */
        if (job.getStatus() == JobStatus.CLOSED) {
            throw new IllegalStateException(
                    "Closed jobs cannot be updated"
            );
        }

        job.setTitle(request.getTitle().trim());

        job.setDescription(
                request.getDescription().trim()
        );

        job.setCompanyName(
                request.getCompanyName().trim()
        );

        job.setLocation(
                request.getLocation().trim()
        );

        job.setSalary(request.getSalary());

        job.setJobType(request.getJobType());

        Job updatedJob = jobRepository.save(job);

        return mapToResponse(updatedJob);
    }

    // =========================================================
    // DELETE JOB
    // =========================================================

    @Override
    @Transactional
    public void deleteJob(
            Long id,
            String email
    ) {

        validateId(id);

        Job job = jobRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Job not found")
                );

        String normalizedEmail = normalizeEmail(email);

        /*
         * Check ownership using the HR already associated
         * with the job. No additional UserRepository lookup
         * is required.
         */
        validateOwnership(
                job,
                normalizedEmail,
                "You cannot delete this job"
        );

        /*
         * Applications must be deleted before the job because
         * applications reference the job.
         */
        applicationRepository.deleteByJobId(id);

        jobRepository.delete(job);
    }

    // =========================================================
    // GET HR OWN JOBS
    // =========================================================

    @Override
    @Transactional
    public List<JobResponse> getMyJobs(String email) {

        String normalizedEmail = normalizeEmail(email);

        User hr = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found")
                );

        List<Job> jobs = jobRepository.findByHrId(
                hr.getId()
        );

        return jobs.stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // ENTITY -> DTO
    // =========================================================

    private JobResponse mapToResponse(Job job) {

        if (job == null) {
            throw new IllegalArgumentException(
                    "Job cannot be null"
            );
        }

        JobResponse response = JobResponse.builder()
                .id(job.getId())
                .title(job.getTitle())
                .description(job.getDescription())
                .companyName(job.getCompanyName())
                .location(job.getLocation())
                .salary(job.getSalary())
                .jobType(job.getJobType())
                .status(job.getStatus())
                .createdAt(job.getCreatedAt())
                .build();

        if (job.getHr() != null) {

            response.setHr(
                    JobResponse.HrInfo.builder()
                            .id(job.getHr().getId())
                            .firstName(job.getHr().getFirstName())
                            .lastName(job.getHr().getLastName())
                            .email(job.getHr().getEmail())
                            .build()
            );
        }

        return response;
    }

    // =========================================================
    // REQUEST VALIDATION
    // =========================================================

    private void validateRequest(
            CreateJobRequest request
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Job request is required"
            );
        }

        if (isBlank(request.getTitle())) {
            throw new IllegalArgumentException(
                    "Job title is required"
            );
        }

        if (isBlank(request.getDescription())) {
            throw new IllegalArgumentException(
                    "Job description is required"
            );
        }

        if (isBlank(request.getCompanyName())) {
            throw new IllegalArgumentException(
                    "Company name is required"
            );
        }

        if (isBlank(request.getLocation())) {
            throw new IllegalArgumentException(
                    "Location is required"
            );
        }

        if (request.getSalary() == null ||
                request.getSalary() < 0) {

            throw new IllegalArgumentException(
                    "Salary must be greater than or equal to 0"
            );
        }

        if (request.getJobType() == null) {
            throw new IllegalArgumentException(
                    "Job type is required"
            );
        }
    }

    // =========================================================
    // ID VALIDATION
    // =========================================================

    private void validateId(Long id) {

        if (id == null || id <= 0) {
            throw new IllegalArgumentException(
                    "Job ID must be greater than 0"
            );
        }
    }

    // =========================================================
    // OWNERSHIP VALIDATION
    // =========================================================

    private void validateOwnership(
            Job job,
            String email,
            String errorMessage
    ) {

        if (job.getHr() == null ||
                job.getHr().getEmail() == null ||
                !job.getHr()
                        .getEmail()
                        .trim()
                        .equalsIgnoreCase(email)) {

            throw new IllegalArgumentException(
                    errorMessage
            );
        }
    }

    // =========================================================
    // EMAIL NORMALIZATION
    // =========================================================

    private String normalizeEmail(String email) {

        if (isBlank(email)) {
            throw new IllegalArgumentException(
                    "Authenticated user email is required"
            );
        }

        return email
                .trim()
                .toLowerCase(Locale.ROOT);
    }

    // =========================================================
    // BLANK CHECK
    // =========================================================

    private boolean isBlank(String value) {

        return value == null || value.isBlank();
    }
}