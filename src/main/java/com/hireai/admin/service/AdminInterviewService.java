package com.hireai.admin.service;

import com.hireai.admin.dto.response.AdminInterviewResponse;

import java.util.List;
import java.util.Map;

public interface AdminInterviewService {

    // =========================================================
    // GET ALL INTERVIEWS
    // =========================================================

    List<AdminInterviewResponse> getAllInterviews();


    // =========================================================
    // GET INTERVIEW BY ID
    // =========================================================

    AdminInterviewResponse getInterviewById(
            Long id
    );


    // =========================================================
    // INTERVIEW STATISTICS
    // =========================================================

    Map<String, Object> getInterviewStatistics();
}