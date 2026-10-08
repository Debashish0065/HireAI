package com.hireai.audit.repository;

import com.hireai.audit.entity.AuditLog;
import com.hireai.audit.enums.AuditAction;
import com.hireai.user.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository
        extends JpaRepository<AuditLog, Long> {

    // Get all audit logs of a specific user
    List<AuditLog> findByUser(User user);

    // Get logs by action
    List<AuditLog> findByAction(AuditAction action);

    // Get logs of a user by action
    List<AuditLog> findByUserAndAction(
            User user,
            AuditAction action
    );

    // Get latest logs first
    List<AuditLog> findAllByOrderByCreatedAtDesc();

    // Get latest logs for a specific user
    List<AuditLog> findByUserOrderByCreatedAtDesc(
            User user
    );
}