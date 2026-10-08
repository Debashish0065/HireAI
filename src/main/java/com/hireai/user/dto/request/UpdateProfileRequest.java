package com.hireai.user.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @Size(max = 20, message = "Phone number must not exceed 20 characters")
    private String phone;

    @Size(max = 150, message = "Location must not exceed 150 characters")
    private String location;

    @Size(max = 200, message = "Headline must not exceed 200 characters")
    private String headline;

    @Size(max = 2000, message = "Bio must not exceed 2000 characters")
    private String bio;

    @Size(max = 2000, message = "Skills must not exceed 2000 characters")
    private String skills;

    @Min(value = 0, message = "Experience cannot be negative")
    private Integer experience;

    @Size(max = 500, message = "LinkedIn URL must not exceed 500 characters")
    private String linkedinUrl;

    @Size(max = 500, message = "GitHub URL must not exceed 500 characters")
    private String githubUrl;

    @Size(max = 500, message = "Portfolio URL must not exceed 500 characters")
    private String portfolioUrl;

    @Size(max = 1000, message = "Profile image URL must not exceed 1000 characters")
    private String profileImage;
}