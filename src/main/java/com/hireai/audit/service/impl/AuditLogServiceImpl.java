package com.hireai.audit.service.impl;

import com.hireai.audit.dto.response.AuditLogResponse;
import com.hireai.audit.entity.AuditLog;
import com.hireai.audit.enums.AuditAction;
import com.hireai.audit.repository.AuditLogRepository;
import com.hireai.audit.service.AuditLogService;
import com.hireai.user.entity.User;
import com.hireai.user.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public AuditLogServiceImpl(
            AuditLogRepository auditLogRepository,
            UserRepository userRepository
    ) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    // =========================================================
    // CREATE AUDIT LOG
    // =========================================================

    @Override
    @Transactional
    public AuditLogResponse createAuditLog(
            Long userId,
            AuditAction action,
            String description,
            String ipAddress
    ) {

        validateUserId(userId);
        validateAction(action);
        validateDescription(description);
        validateIpAddress(ipAddress);

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found with id: " + userId
                        )
                );

        AuditLog auditLog = AuditLog.builder()
                .user(user)
                .action(action)
                .description(description.trim())
                .ipAddress(ipAddress != null ? ipAddress.trim() : null)
                .build();

        AuditLog savedAuditLog = auditLogRepository.save(auditLog);

        return mapToResponse(savedAuditLog);
    }

    // =========================================================
    // GET ALL AUDIT LOGS
    // =========================================================

    @Override
    public List<AuditLogResponse> getAllAuditLogs() {

        return auditLogRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // GET AUDIT LOG BY ID
    // =========================================================

    @Override
    public AuditLogResponse getAuditLogById(Long id) {

        validateId(id);

        AuditLog auditLog = auditLogRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Audit log not found with id: " + id
                        )
                );

        return mapToResponse(auditLog);
    }

    // =========================================================
    // GET LOGS BY USER
    // =========================================================

    @Override
    public List<AuditLogResponse> getLogsByUser(Long userId) {

        validateUserId(userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found with id: " + userId
                        )
                );

        return auditLogRepository
                .findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // GET LOGS BY ACTION
    // =========================================================

    @Override
    public List<AuditLogResponse> getLogsByAction(
            AuditAction action
    ) {

        validateAction(action);

        return auditLogRepository
                .findByAction(action)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // ENTITY -> RESPONSE DTO
    // =========================================================

    private AuditLogResponse mapToResponse(AuditLog auditLog) {

        if (auditLog == null) {
            throw new IllegalArgumentException(
                    "Audit log cannot be null"
            );
        }

        User user = auditLog.getUser();

        String userName = null;

        if (user != null) {

            String firstName = user.getFirstName();
            String lastName = user.getLastName();

            if (firstName != null && !firstName.isBlank()
                    && lastName != null && !lastName.isBlank()) {

                userName = firstName.trim()
                        + " "
                        + lastName.trim();

            } else if (firstName != null
                    && !firstName.isBlank()) {

                userName = firstName.trim();

            } else if (lastName != null
                    && !lastName.isBlank()) {

                userName = lastName.trim();
            }
        }

        return AuditLogResponse.builder()

                .id(auditLog.getId())

                .userId(
                        user != null
                                ? user.getId()
                                : null
                )

                .userName(userName)

                .userEmail(
                        user != null
                                ? user.getEmail()
                                : null
                )

                .action(
                        auditLog.getAction() != null
                                ? auditLog.getAction().name()
                                : null
                )

                .description(
                        auditLog.getDescription()
                )

                .ipAddress(
                        auditLog.getIpAddress()
                )

                .createdAt(
                        auditLog.getCreatedAt()
                )

                .build();
    }

    // =========================================================
    // VALIDATION
    // =========================================================

    private void validateId(Long id) {

        if (id == null || id <= 0) {
            throw new IllegalArgumentException(
                    "ID must be a positive number."
            );
        }
    }

    private void validateUserId(Long userId) {

        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException(
                    "User ID must be a positive number."
            );
        }
    }

    private void validateAction(AuditAction action) {

        if (action == null) {
            throw new IllegalArgumentException(
                    "Audit action is required."
            );
        }
    }

    private void validateDescription(String description) {

        if (description == null || description.isBlank()) {
            throw new IllegalArgumentException(
                    "Audit description is required."
            );
        }

        if (description.trim().length() > 65535) {
            throw new IllegalArgumentException(
                    "Audit description is too long."
            );
        }
    }

    private void validateIpAddress(String ipAddress) {

        if (ipAddress != null
                && ipAddress.length() > 100) {

            throw new IllegalArgumentException(
                    "IP address cannot exceed 100 characters."
            );
        }
    }
}