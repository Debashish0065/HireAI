package com.hireai.application.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApplyJobRequest {

    @NotNull(message = "Job ID is required")
    @Positive(message = "Job ID must be greater than 0")
    private Long jobId;
}