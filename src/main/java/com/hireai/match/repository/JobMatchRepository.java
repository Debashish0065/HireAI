package com.hireai.match.repository;

import com.hireai.job.entity.Job;
import com.hireai.match.entity.JobMatch;
import com.hireai.resume.entity.Resume;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobMatchRepository
        extends JpaRepository<JobMatch, Long> {

    // =========================================================
    // DELETE MATCHES BY RESUME
    // =========================================================

    void deleteAllByResume_Id(Long resumeId);

    // =========================================================
    // FIND MATCH FOR A RESUME AND JOB
    // =========================================================

    Optional<JobMatch> findByResumeAndJob(
            Resume resume,
            Job job
    );

    // =========================================================
    // GET ALL MATCHES FOR A RESUME
    // =========================================================

    List<JobMatch> findByResume(
            Resume resume
    );

    // =========================================================
    // GET ALL MATCHES FOR A JOB
    // =========================================================

    List<JobMatch> findByJob(
            Job job
    );

    // =========================================================
    // CHECK WHETHER MATCH EXISTS
    // =========================================================

    boolean existsByResumeAndJob(
            Resume resume,
            Job job
    );
}