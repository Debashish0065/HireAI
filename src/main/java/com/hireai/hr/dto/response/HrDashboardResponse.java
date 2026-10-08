package com.hireai.hr.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HrDashboardResponse {

    private long totalJobs;

    private long openJobs;

    private long closedJobs;

    private long totalApplicants;

    private long applied;

    private long shortlisted;

    private long interview;

    private long hired;

    private long rejected;
}