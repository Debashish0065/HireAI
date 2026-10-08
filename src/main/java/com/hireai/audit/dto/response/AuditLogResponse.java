package com.hireai.audit.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogResponse {

    private Long id;

    private Long userId;

    private String userName;

    private String userEmail;

    private String action;

    private String description;

    private String ipAddress;

    private LocalDateTime createdAt;
}