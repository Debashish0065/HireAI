package com.hireai.notification.service.impl;

import com.hireai.notification.dto.request.NotificationRequest;
import com.hireai.notification.dto.response.NotificationResponse;
import com.hireai.notification.entity.Notification;
import com.hireai.notification.repository.NotificationRepository;
import com.hireai.notification.service.EmailNotificationService;
import com.hireai.notification.service.NotificationService;
import com.hireai.user.entity.User;
import com.hireai.user.repository.UserRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationServiceImpl
        implements NotificationService {

    private static final Logger log =
            LoggerFactory.getLogger(NotificationServiceImpl.class);

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final EmailNotificationService emailNotificationService;

    public NotificationServiceImpl(
            NotificationRepository notificationRepository,
            UserRepository userRepository,
            EmailNotificationService emailNotificationService
    ) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.emailNotificationService = emailNotificationService;
    }

    // =========================================================
    // CREATE NOTIFICATION
    // =========================================================

    @Override
    @Transactional
    public NotificationResponse createNotification(
            NotificationRequest request
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Notification request is required."
            );
        }

        if (request.getUserId() == null
                || request.getUserId() <= 0) {

            throw new IllegalArgumentException(
                    "User ID must be greater than 0."
            );
        }

        if (request.getTitle() == null
                || request.getTitle().isBlank()) {

            throw new IllegalArgumentException(
                    "Notification title is required."
            );
        }

        if (request.getMessage() == null
                || request.getMessage().isBlank()) {

            throw new IllegalArgumentException(
                    "Notification message is required."
            );
        }

        if (request.getType() == null) {
            throw new IllegalArgumentException(
                    "Notification type is required."
            );
        }

        // -----------------------------------------------------
        // Find target user
        // -----------------------------------------------------

        User user = userRepository
                .findById(request.getUserId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found."
                        )
                );

        // -----------------------------------------------------
        // Normalize notification content
        // -----------------------------------------------------

        String title = request.getTitle().trim();
        String message = request.getMessage().trim();

        // -----------------------------------------------------
        // Create notification
        // -----------------------------------------------------

        Notification notification =
                Notification.builder()
                        .user(user)
                        .title(title)
                        .message(message)
                        .type(request.getType())
                        .isRead(false)
                        .build();

        // -----------------------------------------------------
        // Save notification
        // -----------------------------------------------------

        Notification saved =
                notificationRepository.save(notification);

        // -----------------------------------------------------
        // Send email notification
        // -----------------------------------------------------
        //
        // Email failure must not prevent the database
        // notification from being created.
        // -----------------------------------------------------

        String userEmail = user.getEmail();

        if (userEmail != null && !userEmail.isBlank()) {

            try {

                emailNotificationService.sendEmail(
                        userEmail.trim(),
                        title,
                        message
                );

            } catch (Exception ex) {

                log.error(
                        "Failed to send email notification to user ID {}",
                        user.getId(),
                        ex
                );
            }
        } else {

            log.warn(
                    "Notification created for user ID {} but the user has no email address.",
                    user.getId()
            );
        }

        return mapToResponse(saved);
    }

    // =========================================================
    // GET MY NOTIFICATIONS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(
            String email
    ) {

        User user = findUserByEmail(email);

        return notificationRepository
                .findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // GET UNREAD NOTIFICATIONS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnreadNotifications(
            String email
    ) {

        User user = findUserByEmail(email);

        return notificationRepository
                .findByUserAndIsReadFalseOrderByCreatedAtDesc(user)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // COUNT UNREAD NOTIFICATIONS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(
            String email
    ) {

        User user = findUserByEmail(email);

        return notificationRepository
                .countByUserAndIsReadFalse(user);
    }

    // =========================================================
    // MARK ONE NOTIFICATION AS READ
    // =========================================================

    @Override
    @Transactional
    public NotificationResponse markAsRead(
            Long notificationId,
            String email
    ) {

        validateNotificationId(notificationId);

        User user = findUserByEmail(email);

        // -----------------------------------------------------
        // Fetch notification belonging to this user
        // -----------------------------------------------------

        Notification notification =
                notificationRepository
                        .findByIdAndUser(
                                notificationId,
                                user
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Notification not found."
                                )
                        );

        // -----------------------------------------------------
        // Mark as read
        // -----------------------------------------------------

        if (!Boolean.TRUE.equals(notification.getIsRead())) {

            notification.setIsRead(true);
        }

        Notification updated =
                notificationRepository.save(notification);

        return mapToResponse(updated);
    }

    // =========================================================
    // MARK ALL NOTIFICATIONS AS READ
    // =========================================================

    @Override
    @Transactional
    public void markAllAsRead(
            String email
    ) {

        User user = findUserByEmail(email);

        List<Notification> notifications =
                notificationRepository
                        .findByUserOrderByCreatedAtDesc(user);

        if (notifications.isEmpty()) {
            return;
        }

        boolean hasChanges = false;

        for (Notification notification : notifications) {

            if (!Boolean.TRUE.equals(
                    notification.getIsRead()
            )) {

                notification.setIsRead(true);
                hasChanges = true;
            }
        }

        if (hasChanges) {

            notificationRepository.saveAll(
                    notifications
            );
        }
    }

    // =========================================================
    // DELETE NOTIFICATION
    // =========================================================

    @Override
    @Transactional
    public void deleteNotification(
            Long notificationId,
            String email
    ) {

        validateNotificationId(notificationId);

        User user = findUserByEmail(email);

        // -----------------------------------------------------
        // Fetch only if the notification belongs to this user
        // -----------------------------------------------------

        Notification notification =
                notificationRepository
                        .findByIdAndUser(
                                notificationId,
                                user
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Notification not found."
                                )
                        );

        notificationRepository.delete(notification);
    }

    // =========================================================
    // FIND USER BY EMAIL
    // =========================================================

    private User findUserByEmail(
            String email
    ) {

        if (email == null || email.isBlank()) {

            throw new IllegalArgumentException(
                    "User email is required."
            );
        }

        String normalizedEmail =
                email.trim().toLowerCase();

        return userRepository
                .findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found."
                        )
                );
    }

    // =========================================================
    // VALIDATE NOTIFICATION ID
    // =========================================================

    private void validateNotificationId(
            Long notificationId
    ) {

        if (notificationId == null
                || notificationId <= 0) {

            throw new IllegalArgumentException(
                    "Notification ID must be greater than 0."
            );
        }
    }

    // =========================================================
    // ENTITY -> RESPONSE DTO
    // =========================================================

    private NotificationResponse mapToResponse(
            Notification notification
    ) {

        if (notification == null) {
            throw new IllegalArgumentException(
                    "Notification is required."
            );
        }

        User user = notification.getUser();

        if (user == null || user.getId() == null) {

            throw new IllegalStateException(
                    "Notification user information is unavailable."
            );
        }

        return NotificationResponse.builder()
                .id(notification.getId())
                .userId(user.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}