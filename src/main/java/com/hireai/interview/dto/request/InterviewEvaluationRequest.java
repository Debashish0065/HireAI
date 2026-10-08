package com.hireai.interview.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewEvaluationRequest {

    @NotNull(message = "Interview ID is required")
    @Positive(message = "Interview ID must be greater than 0")
    private Long interviewId;
}