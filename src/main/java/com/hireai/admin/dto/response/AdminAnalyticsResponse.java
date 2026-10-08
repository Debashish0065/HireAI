package com.hireai.admin.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminAnalyticsResponse {

    // =========================================================
    // USER STATISTICS
    // =========================================================

    private long totalUsers;

    private long totalCandidates;

    private long totalHRs;

    private long totalAdmins;


    // =========================================================
    // JOB STATISTICS
    // =========================================================

    private long totalJobs;

    private long openJobs;

    private long closedJobs;


    // =========================================================
    // APPLICATION STATISTICS
    // =========================================================

    private long totalApplications;

    private long appliedApplications;

    private long shortlistedApplications;

    private long interviewApplications;

    private long hiredApplications;

    private long rejectedApplications;


    // =========================================================
    // AI MATCH STATISTICS
    // =========================================================

    private long totalJobMatches;

    /**
     * Average AI job-match score.
     *
     * The value is calculated by the matching service and
     * rounded to two decimal places.
     */
    private double averageMatchScore;


    // =========================================================
    // INTERVIEW STATISTICS
    // =========================================================

    private long totalInterviews;

    private long completedInterviews;


    // =========================================================
    // NOTIFICATION STATISTICS
    // =========================================================

    private long totalNotifications;

    private long unreadNotifications;
}