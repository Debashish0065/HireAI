package com.hireai.interview.entity;

import com.hireai.interview.enums.InterviewStatus;
import com.hireai.job.entity.Job;
import com.hireai.user.entity.User;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "interviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Candidate who is taking the interview.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "candidate_id", nullable = false)
    private User candidate;

    /**
     * Job for which the interview is conducted.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private InterviewStatus status;

    @Column(nullable = false)
    private Integer totalQuestions;

    /**
     * Nullable until the interview has been evaluated.
     */
    private Integer score;

    @Column(length = 3000)
    private String overallFeedback;

    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {

        if (status == null) {
            status = InterviewStatus.NOT_STARTED;
        }

        if (startedAt == null) {
            startedAt = LocalDateTime.now();
        }
    }
}