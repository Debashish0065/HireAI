package com.hireai.user.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserProfileResponse {

    private Long id;

    private String firstName;

    private String lastName;

    private String email;

    private String phone;

    private String location;

    private String headline;

    private String bio;

    private String profileImage;

    private String linkedinUrl;

    private String githubUrl;

    private String portfolioUrl;

    private String resumeUrl;

    private Integer experience;

    private String skills;

    private String role;
}