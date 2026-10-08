package com.hireai.resume.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeAnalysisResponse {

    private Long resumeId;

    private Integer overallScore;

    private String summary;

    private String skills;

    private String strengths;

    private String weaknesses;

    private String missingSkills;

    private String recommendedRoles;

    private String experienceLevel;
}