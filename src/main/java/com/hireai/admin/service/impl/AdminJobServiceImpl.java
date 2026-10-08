package com.hireai.admin.service.impl;

import com.hireai.admin.dto.response.AdminJobResponse;
import com.hireai.admin.service.AdminJobService;
import com.hireai.job.entity.Job;
import com.hireai.job.enums.JobStatus;
import com.hireai.job.repository.JobRepository;
import com.hireai.user.entity.User;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class AdminJobServiceImpl implements AdminJobService {

    private final JobRepository jobRepository;

    public AdminJobServiceImpl(
            JobRepository jobRepository
    ) {
        this.jobRepository = jobRepository;
    }

    // =========================================================
    // GET ALL JOBS
    // =========================================================

    @Override
    public List<AdminJobResponse> getAllJobs() {

        return jobRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // GET JOB BY ID
    // =========================================================

    @Override
    public AdminJobResponse getJobById(Long id) {

        validateId(id);

        Job job = jobRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Job not found with id: " + id
                        )
                );

        return mapToResponse(job);
    }

    // =========================================================
    // CLOSE JOB
    // =========================================================

    @Override
    @Transactional
    public AdminJobResponse closeJob(Long id) {

        validateId(id);

        Job job = jobRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Job not found with id: " + id
                        )
                );

        if (job.getStatus() == JobStatus.CLOSED) {

            throw new IllegalStateException(
                    "Job is already closed."
            );
        }

        job.setStatus(JobStatus.CLOSED);

        Job savedJob = jobRepository.save(job);

        return mapToResponse(savedJob);
    }

    // =========================================================
    // ENTITY -> RESPONSE
    // =========================================================

    private AdminJobResponse mapToResponse(Job job) {

        User hr = job.getHr();

        String hrName = null;
        String hrEmail = null;
        Long hrId = null;

        if (hr != null) {

            hrId = hr.getId();

            hrEmail = hr.getEmail();

            hrName =
                    ((hr.getFirstName() != null
                            ? hr.getFirstName()
                            : "")
                    + " "
                    + (hr.getLastName() != null
                            ? hr.getLastName()
                            : ""))
                    .trim();
        }

        return AdminJobResponse.builder()

                .id(job.getId())

                .title(job.getTitle())

                .companyName(job.getCompanyName())

                .location(job.getLocation())

                .jobType(
                        job.getJobType() != null
                                ? job.getJobType().toString()
                                : null
                )

                .status(
                        job.getStatus() != null
                                ? job.getStatus().name()
                                : null
                )

                .description(job.getDescription())

                .hrId(hrId)

                .hrName(hrName)

                .hrEmail(hrEmail)

                .createdAt(job.getCreatedAt())

                .build();
    }

    // =========================================================
    // ID VALIDATION
    // =========================================================

    private void validateId(Long id) {

        if (id == null || id <= 0) {

            throw new IllegalArgumentException(
                    "Job id must be a positive number."
            );
        }
    }
}