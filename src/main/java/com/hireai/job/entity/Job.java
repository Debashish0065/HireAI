package com.hireai.job.entity;

import com.hireai.job.enums.JobStatus;
import com.hireai.job.enums.JobType;
import com.hireai.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "jobs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 5000)
    private String description;

    @Column(nullable = false, length = 150)
    private String companyName;

    @Column(nullable = false, length = 150)
    private String location;

    @Column(nullable = false)
    private Double salary;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private JobType jobType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private JobStatus status;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hr_id", nullable = false)
    private User hr;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        if (status == null) {
            status = JobStatus.OPEN;
        }
    }
}