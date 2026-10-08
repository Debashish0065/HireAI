package com.hireai.match.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobMatchResponse {

    private Long id;

    private Long resumeId;

    private Long jobId;

    private String jobTitle;

    private String companyName;

    private Integer matchScore;

    private String matchingSkills;

    private String missingSkills;

    private String strengths;

    private String recommendation;

    private LocalDateTime createdAt;
}