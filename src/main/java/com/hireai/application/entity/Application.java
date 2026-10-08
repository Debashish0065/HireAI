package com.hireai.application.entity;

import com.hireai.job.entity.Job;
import com.hireai.user.entity.User;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "applications",
        indexes = {
                @Index(name = "idx_application_candidate", columnList = "candidate_id"),
                @Index(name = "idx_application_job", columnList = "job_id"),
                @Index(name = "idx_application_status", columnList = "status"),
                @Index(name = "idx_application_applied_at", columnList = "appliedAt")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Candidate who submitted the application.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "candidate_id",
            nullable = false
    )
    private User candidate;

    /**
     * Job for which the application was submitted.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "job_id",
            nullable = false
    )
    private Job job;

    /**
     * Current application status.
     */
    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    private ApplicationStatus status;

    /**
     * Date and time when the application was submitted.
     */
    @Column(
            nullable = false,
            updatable = false
    )
    private LocalDateTime appliedAt;

    /**
     * Set default values when a new application is created.
     */
    @PrePersist
    protected void onCreate() {

        if (appliedAt == null) {
            appliedAt = LocalDateTime.now();
        }

        if (status == null) {
            status = ApplicationStatus.APPLIED;
        }
    }
}