package com.hireai.interview.service;

import com.hireai.interview.dto.request.StartInterviewRequest;
import com.hireai.interview.dto.request.SubmitAnswerRequest;
import com.hireai.interview.dto.response.InterviewResponse;
import com.hireai.interview.dto.response.InterviewStatisticsResponse;

import java.util.List;

public interface InterviewService {

    // Candidate starts an AI interview
    InterviewResponse startInterview(
            StartInterviewRequest request,
            String email
    );

    // Candidate gets all own interviews
    List<InterviewResponse> getMyInterviews(
            String email
    );

    // Candidate gets one own interview
    InterviewResponse getMyInterviewById(
            Long interviewId,
            String email
    );
    
    // Admin gets one interview
    InterviewResponse getInterviewByIdForAdmin(
            Long interviewId
    );

    // Candidate submits an answer
    InterviewResponse submitAnswer(
            SubmitAnswerRequest request,
            String email
    );

    // Complete the interview
    InterviewResponse completeInterview(
            Long interviewId,
            String email
    );
    
    // Admin gets all interviews
    List<InterviewResponse> getAllInterviews();
    
    // Admin interview statistics
    InterviewStatisticsResponse getInterviewStatisticsForAdmin();
    
}