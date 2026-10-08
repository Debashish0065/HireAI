package com.hireai.match.entity;

import com.hireai.job.entity.Job;
import com.hireai.resume.entity.Resume;

import jakarta.persistence.*;

import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "job_matches",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_job_match_resume_job",
                        columnNames = {"resume_id", "job_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobMatch {

    // =========================================================
    // PRIMARY KEY
    // =========================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================================================
    // RESUME
    // =========================================================

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "resume_id",
            nullable = false
    )
    private Resume resume;

    // =========================================================
    // JOB
    // =========================================================

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "job_id",
            nullable = false
    )
    private Job job;

    // =========================================================
    // AI MATCH SCORE
    // =========================================================

    @Column(nullable = false)
    private Integer matchScore;

    // =========================================================
    // AI ANALYSIS
    // =========================================================

    @Column(columnDefinition = "TEXT")
    private String matchingSkills;

    @Column(columnDefinition = "TEXT")
    private String missingSkills;

    @Column(columnDefinition = "TEXT")
    private String strengths;

    @Column(columnDefinition = "TEXT")
    private String recommendation;

    // =========================================================
    // CREATED TIME
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
    }
}