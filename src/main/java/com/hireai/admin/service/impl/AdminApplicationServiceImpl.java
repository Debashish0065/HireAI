package com.hireai.admin.service.impl;

import com.hireai.admin.dto.response.AdminApplicationResponse;
import com.hireai.admin.service.AdminApplicationService;

import com.hireai.application.entity.Application;
import com.hireai.application.entity.ApplicationStatus;
import com.hireai.application.repository.ApplicationRepository;

import com.hireai.job.entity.Job;
import com.hireai.user.entity.User;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class AdminApplicationServiceImpl
        implements AdminApplicationService {

    private final ApplicationRepository applicationRepository;

    public AdminApplicationServiceImpl(
            ApplicationRepository applicationRepository
    ) {
        this.applicationRepository = applicationRepository;
    }

    // =========================================================
    // GET ALL APPLICATIONS
    // =========================================================

    @Override
    public List<AdminApplicationResponse> getAllApplications() {

        return applicationRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // GET APPLICATION BY ID
    // =========================================================

    @Override
    public AdminApplicationResponse getApplicationById(
            Long id
    ) {

        validateId(id);

        Application application =
                applicationRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Application not found with id: "
                                                + id
                                )
                        );

        return mapToResponse(application);
    }

    // =========================================================
    // APPLICATION STATISTICS
    // =========================================================

    @Override
    public Map<String, Long> getApplicationStatistics() {

        List<Application> applications =
                applicationRepository.findAll();

        long total = applications.size();

        long applied = countByStatus(
                applications,
                ApplicationStatus.APPLIED
        );

        long shortlisted = countByStatus(
                applications,
                ApplicationStatus.SHORTLISTED
        );

        long interview = countByStatus(
                applications,
                ApplicationStatus.INTERVIEW
        );

        long hired = countByStatus(
                applications,
                ApplicationStatus.HIRED
        );

        long rejected = countByStatus(
                applications,
                ApplicationStatus.REJECTED
        );

        Map<String, Long> statistics =
                new LinkedHashMap<>();

        statistics.put("total", total);
        statistics.put("applied", applied);
        statistics.put("shortlisted", shortlisted);
        statistics.put("interview", interview);
        statistics.put("hired", hired);
        statistics.put("rejected", rejected);

        return statistics;
    }

    // =========================================================
    // COUNT APPLICATIONS BY STATUS
    // =========================================================

    private long countByStatus(
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
    // ENTITY -> RESPONSE
    // =========================================================

    private AdminApplicationResponse mapToResponse(
            Application application
    ) {

        User candidate =
                application.getCandidate();

        Job job =
                application.getJob();

        // =====================================================
        // CANDIDATE
        // =====================================================

        Long candidateId = null;
        String candidateName = null;
        String candidateEmail = null;

        if (candidate != null) {

            candidateId =
                    candidate.getId();

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

            candidateEmail =
                    candidate.getEmail();

            if (candidateName.isBlank()) {
                candidateName = candidateEmail;
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

        return AdminApplicationResponse.builder()

                .id(
                        application.getId()
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
    // ID VALIDATION
    // =========================================================

    private void validateId(Long id) {

        if (id == null || id <= 0) {

            throw new IllegalArgumentException(
                    "Application id must be a positive number."
            );
        }
    }
}