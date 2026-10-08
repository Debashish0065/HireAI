package com.hireai.file.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface FileService {

    String uploadResume(
            MultipartFile file,
            String email
    );

    Resource downloadResume(String email);

    Resource viewResume(String email);

    void deleteResume(String email);
}