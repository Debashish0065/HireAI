package com.hireai.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminApplicationResponse {

    private Long id;

    // Candidate
    private Long candidateId;
    private String candidateName;
    private String candidateEmail;

    // Job
    private Long jobId;
    private String jobTitle;
    private String companyName;

    // Application
    private String status;
    private LocalDateTime appliedAt;
}