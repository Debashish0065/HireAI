package com.hireai.notification.dto.request;

import com.hireai.notification.enums.NotificationType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationRequest {

    @NotNull(message = "User ID is required")
    @Positive(message = "User ID must be greater than 0")
    private Long userId;

    @NotBlank(message = "Title is required")
    @Size(
            max = 200,
            message = "Title must not exceed 200 characters"
    )
    private String title;

    @NotBlank(message = "Message is required")
    @Size(
            max = 2000,
            message = "Message must not exceed 2000 characters"
    )
    private String message;

    @NotNull(message = "Notification type is required")
    private NotificationType type;
}