package com.hireai.analytics.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HRAnalyticsResponse {

    // =========================================================
    // JOB STATISTICS
    // =========================================================

    private long totalJobs;


    // =========================================================
    // APPLICATION STATISTICS
    // =========================================================

    private long totalApplications;

    private long pendingApplications;

    private long shortlistedApplications;

    private long interviewedApplications;

    private long selectedApplications;

    private long rejectedApplications;


    // =========================================================
    // CANDIDATE STATISTICS
    // =========================================================

    private long totalCandidates;


    // =========================================================
    // AI MATCH STATISTICS
    // =========================================================

    private double averageMatchScore;


    // =========================================================
    // INTERVIEW STATISTICS
    // =========================================================

    private double interviewSuccessRate;
}