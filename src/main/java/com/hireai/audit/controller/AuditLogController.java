package com.hireai.audit.controller;

import com.hireai.audit.dto.response.AuditLogResponse;
import com.hireai.audit.enums.AuditAction;
import com.hireai.audit.service.AuditLogService;

import jakarta.validation.constraints.Positive;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/audit-logs")
@Validated
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    /**
     * Get all audit logs.
     *
     * GET /api/v1/audit-logs
     *
     * ADMIN only.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<AuditLogResponse> getAllAuditLogs() {
        return auditLogService.getAllAuditLogs();
    }

    /**
     * Get an audit log by ID.
     *
     * GET /api/v1/audit-logs/{id}
     *
     * ADMIN only.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public AuditLogResponse getAuditLogById(
            @PathVariable
            @Positive(message = "Audit log ID must be greater than 0")
            Long id
    ) {
        return auditLogService.getAuditLogById(id);
    }

    /**
     * Get all audit logs created by a specific user.
     *
     * GET /api/v1/audit-logs/user/{userId}
     *
     * ADMIN only.
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public List<AuditLogResponse> getLogsByUser(
            @PathVariable
            @Positive(message = "User ID must be greater than 0")
            Long userId
    ) {
        return auditLogService.getLogsByUser(userId);
    }

    /**
     * Get audit logs by audit action.
     *
     * GET /api/v1/audit-logs/action/{action}
     *
     * ADMIN only.
     */
    @GetMapping("/action/{action}")
    @PreAuthorize("hasRole('ADMIN')")
    public List<AuditLogResponse> getLogsByAction(
            @PathVariable AuditAction action
    ) {
        return auditLogService.getLogsByAction(action);
    }
}