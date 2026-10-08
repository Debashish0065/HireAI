package com.hireai.interview.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StartInterviewRequest {

    @NotNull(message = "Job ID is required")
    @Positive(message = "Job ID must be greater than 0")
    private Long jobId;

    @NotNull(message = "Total questions is required")
    @Positive(message = "Total questions must be greater than 0")
    private Integer totalQuestions;
}