package com.hireai.interview.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SubmitAnswerRequest {

    @NotNull(message = "Question ID is required")
    @Positive(message = "Question ID must be greater than 0")
    private Long questionId;

    @NotBlank(message = "Answer is required")
    private String answer;
}