package com.hireai.notification.dto.response;

import com.hireai.notification.enums.NotificationType;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {

    private Long id;

    private Long userId;

    private String title;

    private String message;

    private NotificationType type;

    private Boolean isRead;

    private LocalDateTime createdAt;
}