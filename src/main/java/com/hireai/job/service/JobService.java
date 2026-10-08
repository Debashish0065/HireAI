package com.hireai.job.service;


import com.hireai.job.dto.request.CreateJobRequest;
import com.hireai.job.dto.response.JobResponse;

import java.util.List;


public interface JobService {


	JobResponse createJob(CreateJobRequest request,String email);


	List<JobResponse> getAllJobs();


	JobResponse getJobById(Long id);


	List<JobResponse> getMyJobs(String email);


	JobResponse updateJob(Long id,CreateJobRequest request,String email);


	void deleteJob(Long id,String email);

}