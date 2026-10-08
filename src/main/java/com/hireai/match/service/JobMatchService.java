package com.hireai.match.service;

import com.hireai.match.dto.request.JobMatchRequest;
import com.hireai.match.dto.response.JobMatchResponse;

import java.util.List;

public interface JobMatchService {

    // AI match a resume with a job
    JobMatchResponse matchResumeWithJob(
            JobMatchRequest request,
            String email
    );

    // Get all matches for the logged-in candidate
    List<JobMatchResponse> getMyMatches(
            String email
    );

    // Get a specific match
    JobMatchResponse getMatchById(
            Long matchId,
            String email
    );
}