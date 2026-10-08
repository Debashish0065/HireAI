package com.hireai.admin.service;

import com.hireai.admin.dto.response.AdminApplicationResponse;

import java.util.List;
import java.util.Map;

public interface AdminApplicationService {

    List<AdminApplicationResponse> getAllApplications();

    AdminApplicationResponse getApplicationById(
            Long id
    );

    Map<String, Long> getApplicationStatistics();
}