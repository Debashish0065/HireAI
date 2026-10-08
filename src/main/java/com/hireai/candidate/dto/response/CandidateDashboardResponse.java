package com.hireai.candidate.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CandidateDashboardResponse {

    private long totalApplications;

    private long applied;

    private long shortlisted;

    private long interview;

    private long hired;

    private long rejected;

    private long totalInterviews;

    private long completedInterviews;

    private double averageInterviewScore;
}