package com.hireai.notification.entity;

import com.hireai.notification.enums.NotificationType;
import com.hireai.user.entity.User;

import jakarta.persistence.*;

import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================================================
    // USER
    // =========================================================

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    // =========================================================
    // TITLE
    // =========================================================

    @Column(
            nullable = false,
            length = 200
    )
    private String title;

    // =========================================================
    // MESSAGE
    // =========================================================

    @Column(
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String message;

    // =========================================================
    // TYPE
    // =========================================================

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 50
    )
    private NotificationType type;

    // =========================================================
    // READ STATUS
    // =========================================================

    @Column(
            nullable = false
    )
    @Builder.Default
    private Boolean isRead = false;

    // =========================================================
    // CREATED AT
    // =========================================================

    @Column(
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    // =========================================================
    // PRE PERSIST
    // =========================================================

    @PrePersist
    protected void onCreate() {

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        if (isRead == null) {
            isRead = false;
        }
    }
}