package com.hireai.admin.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AdminUserResponse {

    private Long id;

    private String firstName;

    private String lastName;

    private String email;

    private String role;

    private String phone;

    private String location;

    private String headline;

    private Integer experience;

    private LocalDateTime createdAt;
}