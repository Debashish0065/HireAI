package com.hireai.interview.repository;

import com.hireai.interview.entity.Interview;
import com.hireai.interview.entity.InterviewEvaluation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewEvaluationRepository
        extends JpaRepository<InterviewEvaluation, Long> {

    // Find evaluation for an interview
    Optional<InterviewEvaluation> findByInterview(
            Interview interview
    );

    // Check whether evaluation already exists
    boolean existsByInterview(
            Interview interview
    );

    // Get all evaluations
    List<InterviewEvaluation> findAllByOrderByCreatedAtDesc();
}