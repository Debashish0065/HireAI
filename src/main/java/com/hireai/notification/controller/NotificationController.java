package com.hireai.notification.controller;

import com.hireai.notification.dto.request.NotificationRequest;
import com.hireai.notification.dto.response.NotificationResponse;
import com.hireai.notification.service.NotificationService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@Validated
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(
            NotificationService notificationService
    ) {
        this.notificationService = notificationService;
    }

    // =========================================================
    // CREATE NOTIFICATION
    // POST /api/v1/notifications
    // =========================================================

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<NotificationResponse> createNotification(
            @Valid @RequestBody NotificationRequest request
    ) {

        NotificationResponse response =
                notificationService.createNotification(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // =========================================================
    // GET MY NOTIFICATIONS
    // GET /api/v1/notifications/my
    // =========================================================

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(
            Authentication authentication
    ) {

        String email = getAuthenticatedEmail(authentication);

        List<NotificationResponse> notifications =
                notificationService.getMyNotifications(email);

        return ResponseEntity.ok(notifications);
    }

    // =========================================================
    // GET UNREAD NOTIFICATIONS
    // GET /api/v1/notifications/unread
    // =========================================================

    @GetMapping("/unread")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications(
            Authentication authentication
    ) {

        String email = getAuthenticatedEmail(authentication);

        List<NotificationResponse> notifications =
                notificationService.getUnreadNotifications(email);

        return ResponseEntity.ok(notifications);
    }

    // =========================================================
    // GET UNREAD COUNT
    // GET /api/v1/notifications/unread/count
    // =========================================================

    @GetMapping("/unread/count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Long> getUnreadCount(
            Authentication authentication
    ) {

        String email = getAuthenticatedEmail(authentication);

        long count =
                notificationService.getUnreadCount(email);

        return ResponseEntity.ok(count);
    }

    // =========================================================
    // MARK ONE NOTIFICATION AS READ
    // PATCH /api/v1/notifications/{id}/read
    // =========================================================

    @PatchMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable
            @Positive(message = "Notification ID must be greater than 0")
            Long id,
            Authentication authentication
    ) {

        String email = getAuthenticatedEmail(authentication);

        NotificationResponse response =
                notificationService.markAsRead(
                        id,
                        email
                );

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // MARK ALL NOTIFICATIONS AS READ
    // PATCH /api/v1/notifications/read-all
    // =========================================================

    @PatchMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> markAllAsRead(
            Authentication authentication
    ) {

        String email = getAuthenticatedEmail(authentication);

        notificationService.markAllAsRead(email);

        return ResponseEntity.ok(
                "All notifications marked as read"
        );
    }

    // =========================================================
    // DELETE NOTIFICATION
    // DELETE /api/v1/notifications/{id}
    // =========================================================

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> deleteNotification(
            @PathVariable
            @Positive(message = "Notification ID must be greater than 0")
            Long id,
            Authentication authentication
    ) {

        String email = getAuthenticatedEmail(authentication);

        notificationService.deleteNotification(
                id,
                email
        );

        return ResponseEntity.ok(
                "Notification deleted successfully"
        );
    }

    // =========================================================
    // AUTHENTICATED USER VALIDATION
    // =========================================================

    private String getAuthenticatedEmail(
            Authentication authentication
    ) {

        if (authentication == null) {
            throw new IllegalStateException(
                    "Authentication information is unavailable."
            );
        }

        String email = authentication.getName();

        if (email == null || email.isBlank()) {
            throw new IllegalStateException(
                    "Authenticated user email is unavailable."
            );
        }

        return email.trim();
    }
}