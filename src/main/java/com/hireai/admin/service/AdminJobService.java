package com.hireai.admin.service;

import com.hireai.admin.dto.response.AdminJobResponse;

import java.util.List;

public interface AdminJobService {

    List<AdminJobResponse> getAllJobs();

    AdminJobResponse getJobById(Long id);

    AdminJobResponse closeJob(Long id);
}