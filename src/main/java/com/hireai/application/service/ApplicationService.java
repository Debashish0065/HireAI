package com.hireai.application.service;

import com.hireai.application.dto.request.ApplyJobRequest;
import com.hireai.application.dto.request.UpdateApplicationStatusRequest;
import com.hireai.application.dto.response.ApplicationResponse;

import java.util.List;

public interface ApplicationService {

    // =========================================================
    // CANDIDATE - APPLY FOR JOB
    // =========================================================

    ApplicationResponse applyJob(
            ApplyJobRequest request,
            String email
    );


    // =========================================================
    // CANDIDATE - MY APPLICATIONS
    // =========================================================

    List<ApplicationResponse> getMyApplications(
            String email
    );


    // =========================================================
    // CANDIDATE - GET APPLICATION BY ID
    // =========================================================

    ApplicationResponse getMyApplicationById(
            Long applicationId,
            String email
    );


    // =========================================================
    // CANDIDATE - WITHDRAW APPLICATION
    // =========================================================

    void withdrawApplication(
            Long applicationId,
            String email
    );


    // =========================================================
    // HR - GET ALL APPLICANTS
    // =========================================================

    List<ApplicationResponse> getApplicantsForHR(
            String email
    );


    // =========================================================
    // HR - GET APPLICANTS FOR SPECIFIC JOB
    // =========================================================

    List<ApplicationResponse> getApplicantsForHRJob(
            Long jobId,
            String email
    );


    // =========================================================
    // HR - UPDATE APPLICATION STATUS
    // =========================================================

    ApplicationResponse updateStatus(
            Long applicationId,
            UpdateApplicationStatusRequest request,
            String email
    );


    // =========================================================
    // CANDIDATE - CHECK IF ALREADY APPLIED
    // =========================================================

    boolean hasApplied(
            Long jobId,
            String email
    );
}