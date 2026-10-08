package com.hireai.application.repository;

import com.hireai.application.entity.Application;
import com.hireai.job.entity.Job;
import com.hireai.user.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    /**
     * Get all applications submitted by a candidate.
     */
    List<Application> findByCandidate(User candidate);

    /**
     * Get all applications for jobs posted by a specific HR.
     */
    List<Application> findByJobHr(User hr);

    /**
     * Check whether a candidate has already applied for a job.
     */
    boolean existsByCandidateAndJob(User candidate, Job job);

    /**
     * Find a specific application belonging to a specific candidate.
     * Used to enforce candidate ownership.
     */
    Optional<Application> findByIdAndCandidate(
            Long id,
            User candidate
    );

    /**
     * Count applications for a specific job.
     */
    long countByJobId(Long jobId);

    /**
     * Delete all applications belonging to a specific job.
     */
    long deleteByJobId(Long jobId);

    /**
     * Get all applications for a specific job.
     */
    List<Application> findByJob(Job job);

    /**
     * Get applications for a specific job
     * only when that job belongs to the specified HR.
     */
    List<Application> findByJob_IdAndJob_Hr(
            Long jobId,
            User hr
    );

    /**
     * Get candidate applications ordered by newest first.
     */
    List<Application> findByCandidateOrderByAppliedAtDesc(
            User candidate
    );

    /**
     * Get job applications ordered by newest first.
     */
    List<Application> findByJobOrderByAppliedAtDesc(
            Job job
    );

    /**
     * Count all applications belonging to jobs
     * posted by a specific HR.
     */
    long countByJob_Hr(User hr);

    /**
     * Security check:
     * Determines whether a candidate has applied
     * to any job belonging to the specified HR.
     *
     * This prevents an HR from accessing an unrelated
     * candidate's resume.
     */
    boolean existsByCandidateAndJob_Hr(
            User candidate,
            User hr
    );
}