package com.hireai.interview.repository;

import com.hireai.interview.entity.Interview;
import com.hireai.interview.enums.InterviewStatus;
import com.hireai.job.entity.Job;
import com.hireai.user.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewRepository
        extends JpaRepository<Interview, Long> {

    // Candidate's interviews
    List<Interview> findByCandidate(User candidate);

    // Interviews for a specific job
    List<Interview> findByJob(Job job);

    // Find interview belonging to a candidate
    Optional<Interview> findByIdAndCandidate(
            Long id,
            User candidate
    );

    // Check if candidate already has an interview for a job
    boolean existsByCandidateAndJob(
            User candidate,
            Job job
    );

    // Find interviews by status
    List<Interview> findByStatus(
            InterviewStatus status
    );
}