package com.hireai.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateApplicationStatusRequest {

    @NotBlank(message = "Application status is required")
    private String status;
}