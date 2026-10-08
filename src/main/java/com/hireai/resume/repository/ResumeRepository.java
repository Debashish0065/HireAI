package com.hireai.resume.repository;

import com.hireai.resume.entity.Resume;
import com.hireai.user.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ResumeRepository
        extends JpaRepository<Resume, Long> {

    // Get all resumes of a candidate
    List<Resume> findByCandidate(User candidate);

    // Get a specific resume belonging to a candidate
    Optional<Resume> findByIdAndCandidate(
            Long id,
            User candidate
    );

    // Get the latest resume of a candidate
    Optional<Resume> findTopByCandidateOrderByUploadedAtDesc(
            User candidate
    );
}