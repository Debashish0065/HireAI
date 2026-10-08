package com.hireai.job.dto.request;

import com.hireai.job.enums.JobType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateJobRequest {

    @NotBlank(message = "Job title is required")
    @Size(max = 150, message = "Job title must not exceed 150 characters")
    private String title;

    @NotBlank(message = "Job description is required")
    @Size(max = 5000, message = "Job description must not exceed 5000 characters")
    private String description;

    @NotBlank(message = "Company name is required")
    @Size(max = 150, message = "Company name must not exceed 150 characters")
    private String companyName;

    @NotBlank(message = "Location is required")
    @Size(max = 150, message = "Location must not exceed 150 characters")
    private String location;

    @NotNull(message = "Salary is required")
    @DecimalMin(
            value = "0.0",
            inclusive = true,
            message = "Salary must be greater than or equal to 0"
    )
    private Double salary;

    @NotNull(message = "Job type is required")
    private JobType jobType;
}