package com.hireai.job.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import com.hireai.job.enums.JobType;
import com.hireai.job.enums.JobStatus;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobResponse {


    private Long id;

    private String title;

    private String description;

    private String companyName;

    private String location;

    private Double salary;

    private JobType jobType;

    private JobStatus status;

    private HrInfo hr;

    private LocalDateTime createdAt;



    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HrInfo {

        private Long id;

        private String firstName;

        private String lastName;

        private String email;

    }

}