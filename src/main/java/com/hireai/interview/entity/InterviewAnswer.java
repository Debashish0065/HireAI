package com.hireai.interview.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "interview_answers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================================================
    // INTERVIEW
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "interview_id",
            nullable = false
    )
    private Interview interview;

    // =========================================================
    // QUESTION
    // =========================================================

    /**
     * Stores the exact question presented to the candidate.
     * Keeping the question text preserves the interview snapshot.
     */
    @Column(
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String question;

    // =========================================================
    // CANDIDATE ANSWER
    // =========================================================

    @Column(
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String answer;

    // =========================================================
    // AI SCORE
    // =========================================================

    /**
     * Score assigned to this answer.
     *
     * This remains non-null because the current model represents
     * an InterviewAnswer as an evaluated answer.
     */
    @Column(nullable = false)
    private Integer score;

    // =========================================================
    // AI FEEDBACK
    // =========================================================

    @Column(columnDefinition = "TEXT")
    private String feedback;

    // =========================================================
    // CREATED TIME
    // =========================================================

    @Column(nullable = false)
    private LocalDateTime createdAt;

    // =========================================================
    // PRE PERSIST
    // =========================================================

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}