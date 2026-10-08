package com.hireai.file.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileResponse {

    private Long id;

    private String originalFileName;

    private String contentType;

    private Long fileSize;

    private LocalDateTime uploadedAt;
}