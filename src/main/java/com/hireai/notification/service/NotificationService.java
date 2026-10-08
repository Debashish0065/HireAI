package com.hireai.notification.service;

import com.hireai.notification.dto.request.NotificationRequest;
import com.hireai.notification.dto.response.NotificationResponse;

import java.util.List;

public interface NotificationService {

    // =========================================================
    // CREATE NOTIFICATION
    // =========================================================

    NotificationResponse createNotification(
            NotificationRequest request
    );


    // =========================================================
    // GET MY NOTIFICATIONS
    // =========================================================

    List<NotificationResponse> getMyNotifications(
            String email
    );


    // =========================================================
    // GET MY UNREAD NOTIFICATIONS
    // =========================================================

    List<NotificationResponse> getUnreadNotifications(
            String email
    );


    // =========================================================
    // COUNT UNREAD NOTIFICATIONS
    // =========================================================

    long getUnreadCount(
            String email
    );


    // =========================================================
    // MARK ONE NOTIFICATION AS READ
    // =========================================================

    NotificationResponse markAsRead(
            Long notificationId,
            String email
    );


    // =========================================================
    // MARK ALL NOTIFICATIONS AS READ
    // =========================================================

    void markAllAsRead(
            String email
    );


    // =========================================================
    // DELETE NOTIFICATION
    // =========================================================

    void deleteNotification(
            Long notificationId,
            String email
    );
}