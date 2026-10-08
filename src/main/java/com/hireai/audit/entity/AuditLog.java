package com.hireai.audit.entity;

import com.hireai.audit.enums.AuditAction;
import com.hireai.user.entity.User;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // =========================================================
    // USER WHO PERFORMED THE ACTION
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;


    // =========================================================
    // ACTION
    // =========================================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private AuditAction action;


    // =========================================================
    // DESCRIPTION
    // =========================================================

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;


    // =========================================================
    // IP ADDRESS
    // =========================================================

    @Column(name = "ip_address", length = 100)
    private String ipAddress;


    // =========================================================
    // CREATED TIME
    // =========================================================

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;


    // =========================================================
    // AUTOMATIC TIMESTAMP
    // =========================================================

    @PrePersist
    protected void onCreate() {

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}