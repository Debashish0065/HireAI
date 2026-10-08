package com.hireai.notification.repository;

import com.hireai.notification.entity.Notification;
import com.hireai.user.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    // =========================================================
    // GET USER NOTIFICATIONS
    // =========================================================

    List<Notification> findByUserOrderByCreatedAtDesc(
            User user
    );

    // =========================================================
    // GET UNREAD NOTIFICATIONS
    // =========================================================

    List<Notification> findByUserAndIsReadFalseOrderByCreatedAtDesc(
            User user
    );

    // =========================================================
    // COUNT UNREAD NOTIFICATIONS
    // =========================================================

    long countByUserAndIsReadFalse(
            User user
    );

    // =========================================================
    // FIND USER'S NOTIFICATION
    // =========================================================

    Optional<Notification> findByIdAndUser(
            Long id,
            User user
    );

    // =========================================================
    // DELETE USER NOTIFICATIONS
    // =========================================================

    void deleteByUser(
            User user
    );
}