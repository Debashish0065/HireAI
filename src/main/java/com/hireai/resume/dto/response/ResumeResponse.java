package com.hireai.resume.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeResponse {

    private Long id;

    private String fileName;

    private String fileUrl;

    private String contentType;

    private Long fileSize;

    private LocalDateTime uploadedAt;
    
    private Long candidateId;

    private String candidateName;

    private String candidateEmail;

    private String resumeUrl;
    
}