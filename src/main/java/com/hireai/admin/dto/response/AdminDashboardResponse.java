package com.hireai.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {

    // =========================================================
    // USERS
    // =========================================================

    private long totalUsers;

    private long totalCandidates;

    private long totalHR;

    private long totalAdmins;


    // =========================================================
    // JOBS
    // =========================================================

    private long totalJobs;

    private long openJobs;

    private long closedJobs;


    // =========================================================
    // APPLICATIONS
    // =========================================================

    private long totalApplications;

    private long appliedApplications;

    private long shortlistedApplications;

    private long interviewApplications;

    private long hiredApplications;

    private long rejectedApplications;


    // =========================================================
    // RESUMES
    // =========================================================

    private long totalResumes;


    // =========================================================
    // AI JOB MATCHING
    // =========================================================

    private long totalJobMatches;

    private double averageMatchScore;
}