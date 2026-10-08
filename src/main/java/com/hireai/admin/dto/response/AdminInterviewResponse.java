package com.hireai.admin.dto.response;

import com.hireai.interview.enums.InterviewStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminInterviewResponse {

    // =========================================================
    // INTERVIEW
    // =========================================================

    private Long id;

    private InterviewStatus status;

    private Integer totalQuestions;

    private Integer score;

    private String overallFeedback;

    private LocalDateTime startedAt;

    private LocalDateTime completedAt;


    // =========================================================
    // CANDIDATE
    // =========================================================

    private Long candidateId;

    private String candidateName;

    private String candidateEmail;


    // =========================================================
    // JOB
    // =========================================================

    private Long jobId;

    private String jobTitle;

    private String companyName;
}