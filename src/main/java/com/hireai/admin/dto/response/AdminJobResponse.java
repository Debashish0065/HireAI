package com.hireai.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminJobResponse {

    private Long id;

    private String title;

    private String companyName;

    private String location;

    private String jobType;

    private String status;

    private String description;

    private Long hrId;

    private String hrName;

    private String hrEmail;

    private LocalDateTime createdAt;
}