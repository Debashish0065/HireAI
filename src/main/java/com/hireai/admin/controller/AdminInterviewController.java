package com.hireai.admin.controller;

import com.hireai.admin.dto.response.AdminInterviewResponse;
import com.hireai.admin.service.AdminInterviewService;

import jakarta.validation.constraints.Positive;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/v1/admin/interviews")
@PreAuthorize("hasRole('ADMIN')")
@Validated
public class AdminInterviewController {

    private final AdminInterviewService adminInterviewService;


    public AdminInterviewController(
            AdminInterviewService adminInterviewService) {

        this.adminInterviewService =
                adminInterviewService;
    }


    // =========================================================
    // GET ALL INTERVIEWS
    // =========================================================

    @GetMapping
    public List<AdminInterviewResponse> getAllInterviews() {

        return adminInterviewService
                .getAllInterviews();
    }


    // =========================================================
    // INTERVIEW STATISTICS
    // =========================================================

    @GetMapping("/statistics")
    public Map<String, Object> getInterviewStatistics() {

        return adminInterviewService
                .getInterviewStatistics();
    }


    // =========================================================
    // GET INTERVIEW BY ID
    // =========================================================

    @GetMapping("/{id}")
    public AdminInterviewResponse getInterviewById(

            @PathVariable
            @Positive(message = "Interview ID must be positive")
            Long id

    ) {

        return adminInterviewService
                .getInterviewById(id);
    }
}