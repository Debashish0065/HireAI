package com.hireai.interview.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewEvaluationResponse {

    private Long id;

    private Long interviewId;

    private Integer overallScore;

    private Integer technicalScore;

    private Integer communicationScore;

    private Integer confidenceScore;

    private String strengths;

    private String weaknesses;

    private String feedback;

    private String recommendation;

    private LocalDateTime createdAt;
}