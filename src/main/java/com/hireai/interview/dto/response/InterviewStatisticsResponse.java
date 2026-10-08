package com.hireai.interview.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InterviewStatisticsResponse {

    private long totalInterviews;

    private long completedInterviews;

    private long inProgressInterviews;

    private double averageScore;

    private int highestScore;

    private int lowestScore;
}