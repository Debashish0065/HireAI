package com.hireai.audit.service;

import com.hireai.audit.dto.response.AuditLogResponse;
import com.hireai.audit.enums.AuditAction;

import java.util.List;

public interface AuditLogService {

    // =========================================================
    // CREATE AUDIT LOG
    // =========================================================

    AuditLogResponse createAuditLog(
            Long userId,
            AuditAction action,
            String description,
            String ipAddress
    );


    // =========================================================
    // GET ALL AUDIT LOGS
    // =========================================================

    List<AuditLogResponse> getAllAuditLogs();


    // =========================================================
    // GET AUDIT LOG BY ID
    // =========================================================

    AuditLogResponse getAuditLogById(
            Long id
    );


    // =========================================================
    // GET LOGS BY USER
    // =========================================================

    List<AuditLogResponse> getLogsByUser(
            Long userId
    );


    // =========================================================
    // GET LOGS BY ACTION
    // =========================================================

    List<AuditLogResponse> getLogsByAction(
            AuditAction action
    );
}