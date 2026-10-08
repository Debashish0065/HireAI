package com.hireai.admin.controller;

import com.hireai.admin.dto.response.AdminJobResponse;
import com.hireai.admin.service.AdminJobService;

import jakarta.validation.constraints.Positive;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/v1/admin/jobs")
@PreAuthorize("hasRole('ADMIN')")
@Validated
public class AdminJobController {

    private final AdminJobService adminJobService;


    public AdminJobController(
            AdminJobService adminJobService) {

        this.adminJobService =
                adminJobService;
    }


    // =========================================================
    // GET ALL JOBS
    // =========================================================

    @GetMapping
    public List<AdminJobResponse> getAllJobs() {

        return adminJobService.getAllJobs();
    }


    // =========================================================
    // GET JOB BY ID
    // =========================================================

    @GetMapping("/{id}")
    public AdminJobResponse getJobById(

            @PathVariable
            @Positive(message = "Job ID must be positive")
            Long id

    ) {

        return adminJobService.getJobById(id);
    }


    // =========================================================
    // CLOSE JOB
    // =========================================================

    @PutMapping("/{id}/close")
    public AdminJobResponse closeJob(

            @PathVariable
            @Positive(message = "Job ID must be positive")
            Long id

    ) {

        return adminJobService.closeJob(id);
    }
}