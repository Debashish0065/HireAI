package com.hireai.resume.service;

import com.hireai.resume.dto.response.ResumeResponse;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface ResumeService {

    ResumeResponse uploadResume(
            MultipartFile file,
            String email
    );

    List<ResumeResponse> getMyResumes(
            String email
    );

    ResumeResponse getResumeById(
            Long id,
            String email
    );

    void deleteResume(
            Long id,
            String email
    );
    
    ResumeResponse getCandidateResume(
            Long candidateId,
            String hrEmail
    );
    ResponseEntity<Resource> downloadCandidateResume(
            Long candidateId,
            String hrEmail
    );
    
    ResponseEntity<Resource> viewResume(
            Long id,
            String email
    );
    
    
}