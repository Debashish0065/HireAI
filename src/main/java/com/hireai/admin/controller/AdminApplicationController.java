package com.hireai.admin.controller;

import com.hireai.admin.dto.response.AdminApplicationResponse;
import com.hireai.admin.service.AdminApplicationService;

import jakarta.validation.constraints.Positive;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/v1/admin/applications")
@PreAuthorize("hasRole('ADMIN')")
@Validated
public class AdminApplicationController {

    private final AdminApplicationService adminApplicationService;


    public AdminApplicationController(
            AdminApplicationService adminApplicationService) {

        this.adminApplicationService =
                adminApplicationService;
    }


    // =========================================================
    // GET ALL APPLICATIONS
    // =========================================================

    @GetMapping
    public List<AdminApplicationResponse> getAllApplications() {

        return adminApplicationService
                .getAllApplications();
    }


    // =========================================================
    // GET APPLICATION BY ID
    // =========================================================

    @GetMapping("/{id}")
    public AdminApplicationResponse getApplicationById(

            @PathVariable
            @Positive(message = "Application ID must be positive")
            Long id

    ) {

        return adminApplicationService
                .getApplicationById(id);
    }


    // =========================================================
    // APPLICATION STATISTICS
    // =========================================================

    @GetMapping("/statistics")
    public Map<String, Long> getApplicationStatistics() {

        return adminApplicationService
                .getApplicationStatistics();
    }
}