package com.hireai.resume.entity;

import com.hireai.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "resumes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            nullable = false,
            length = 255
    )
    private String fileName;

    @Column(
            nullable = false,
            length = 500
    )
    private String fileUrl;

    @Column(
            length = 100
    )
    private String contentType;

    @Column(
            nullable = false
    )
    private Long fileSize;

    @Column(
            columnDefinition = "LONGTEXT",
            nullable = true
    )
    private String extractedText;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "candidate_id",
            nullable = false
    )
    private User candidate;

    @Column(
            nullable = false,
            updatable = false
    )
    private LocalDateTime uploadedAt;

    @PrePersist
    protected void onCreate() {
        if (uploadedAt == null) {
            uploadedAt = LocalDateTime.now();
        }
    }
}