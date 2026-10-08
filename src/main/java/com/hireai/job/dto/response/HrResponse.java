package com.hireai.job.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HrResponse {

    private Long id;

    private String firstName;

    private String lastName;

    private String email;

}