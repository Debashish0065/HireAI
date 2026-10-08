package com.hireai.interview.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "interview_evaluations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewEvaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================================================
    // INTERVIEW
    // =========================================================

    /**
     * Each interview can have only one final evaluation.
     */
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "interview_id",
            nullable = false,
            unique = true
    )
    private Interview interview;

    // =========================================================
    // SCORES
    // =========================================================

    @Column(nullable = false)
    private Integer overallScore;

    @Column(nullable = false)
    private Integer technicalScore;

    @Column(nullable = false)
    private Integer communicationScore;

    @Column(nullable = false)
    private Integer confidenceScore;

    // =========================================================
    // AI ANALYSIS
    // =========================================================

    @Column(columnDefinition = "TEXT")
    private String strengths;

    @Column(columnDefinition = "TEXT")
    private String weaknesses;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(length = 100)
    private String recommendation;

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