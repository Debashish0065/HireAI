package com.hireai.job.repository;

import com.hireai.job.entity.Job;
import com.hireai.job.enums.JobStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    // Get jobs created by a specific HR
    List<Job> findByHrId(Long hrId);

    // Get jobs by status
    List<Job> findByStatus(JobStatus status);

    // Get jobs by status ordered by newest first
    List<Job> findByStatusOrderByCreatedAtDesc(JobStatus status);

    // Get HR's jobs by status
    List<Job> findByHrIdAndStatus(Long hrId, JobStatus status);
}