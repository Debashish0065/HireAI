package com.hireai.application.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ApplicationResponse {

    private Long id;

    private Long jobId;

    private String jobTitle;

    private String companyName;

    private String candidateName;

    private String candidateEmail;

    private String status;

    private LocalDateTime appliedAt;
}