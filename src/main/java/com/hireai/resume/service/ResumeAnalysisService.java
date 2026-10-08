package com.hireai.resume.service;

import com.hireai.resume.dto.response.ResumeAnalysisResponse;

public interface ResumeAnalysisService {

    ResumeAnalysisResponse analyzeResume(
            Long resumeId,
            String email
    );
}