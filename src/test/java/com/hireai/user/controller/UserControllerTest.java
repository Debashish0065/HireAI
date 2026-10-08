package com.hireai.user.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hireai.user.dto.request.UpdateProfileRequest;
import com.hireai.user.dto.response.UserProfileResponse;
import com.hireai.user.service.UserService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private UserController userController;

    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    private final String email =
            "john.doe@gmail.com";

    @BeforeEach
    void setUp() {

        mockMvc =
                MockMvcBuilders
                        .standaloneSetup(userController)
                        .build();

        objectMapper =
                new ObjectMapper();

        when(authentication.getName())
                .thenReturn(email);
    }

    // =========================================================
    // GET PROFILE - SUCCESS
    // =========================================================

    @Test
    void profile_ShouldReturn200_WhenProfileExists()
            throws Exception {

        UserProfileResponse response =
                UserProfileResponse.builder()
                        .id(1L)
                        .firstName("John")
                        .lastName("Doe")
                        .email(email)
                        .phone("9876543210")
                        .location("Bhubaneswar")
                        .headline("Java Developer")
                        .bio("Java Spring Boot Developer")
                        .profileImage("profile.jpg")
                        .linkedinUrl("https://linkedin.com/in/johndoe")
                        .githubUrl("https://github.com/johndoe")
                        .portfolioUrl("https://johndoe.dev")
                        .resumeUrl("/uploads/resumes/resume.pdf")
                        .experience(2)
                        .skills("Java, Spring Boot, MySQL")
                        .role("CANDIDATE")
                        .build();

        when(userService.getProfile(email))
                .thenReturn(response);

        mockMvc.perform(
                get("/api/v1/users/profile")
                        .principal(authentication)
        )
        .andExpect(status().isOk())
        .andExpect(content()
                .contentTypeCompatibleWith(
                        MediaType.APPLICATION_JSON
                ));
    }

    // =========================================================
    // GET PROFILE - VERIFY SERVICE
    // =========================================================

    @Test
    void profile_ShouldCallUserService()
            throws Exception {

        UserProfileResponse response =
                UserProfileResponse.builder()
                        .id(1L)
                        .firstName("John")
                        .lastName("Doe")
                        .email(email)
                        .role("CANDIDATE")
                        .build();

        when(userService.getProfile(email))
                .thenReturn(response);

        mockMvc.perform(
                get("/api/v1/users/profile")
                        .principal(authentication)
        )
        .andExpect(status().isOk());

        verify(userService)
                .getProfile(email);
    }

    // =========================================================
    // GET PROFILE - RESPONSE DATA
    // =========================================================

    @Test
    void profile_ShouldReturnCorrectProfileData()
            throws Exception {

        UserProfileResponse response =
                UserProfileResponse.builder()
                        .id(10L)
                        .firstName("Debashis")
                        .lastName("Satapathy")
                        .email(email)
                        .phone("9876543210")
                        .location("Odisha")
                        .headline("Java Full Stack Developer")
                        .bio("Spring Boot Developer")
                        .experience(1)
                        .skills("Java, Spring Boot, MySQL")
                        .role("CANDIDATE")
                        .build();

        when(userService.getProfile(email))
                .thenReturn(response);

        mockMvc.perform(
                get("/api/v1/users/profile")
                        .principal(authentication)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id")
                .value(10))
        .andExpect(jsonPath("$.firstName")
                .value("Debashis"))
        .andExpect(jsonPath("$.lastName")
                .value("Satapathy"))
        .andExpect(jsonPath("$.email")
                .value(email))
        .andExpect(jsonPath("$.role")
                .value("CANDIDATE"))
        .andExpect(jsonPath("$.experience")
                .value(1));
    }

    // =========================================================
    // UPDATE PROFILE - SUCCESS
    // =========================================================

    @Test
    void updateProfile_ShouldReturn200_WhenUpdateIsSuccessful()
            throws Exception {

        UpdateProfileRequest request =
                new UpdateProfileRequest();

        request.setPhone("9876543210");
        request.setLocation("Bhubaneswar");
        request.setHeadline("Java Developer");
        request.setBio("Spring Boot Developer");
        request.setSkills("Java, Spring Boot, MySQL");
        request.setExperience(2);
        request.setLinkedinUrl(
                "https://linkedin.com/in/johndoe"
        );
        request.setGithubUrl(
                "https://github.com/johndoe"
        );
        request.setPortfolioUrl(
                "https://johndoe.dev"
        );
        request.setProfileImage("profile.jpg");

        UserProfileResponse response =
                UserProfileResponse.builder()
                        .id(1L)
                        .firstName("John")
                        .lastName("Doe")
                        .email(email)
                        .phone("9876543210")
                        .location("Bhubaneswar")
                        .headline("Java Developer")
                        .bio("Spring Boot Developer")
                        .skills("Java, Spring Boot, MySQL")
                        .experience(2)
                        .role("CANDIDATE")
                        .build();

        when(userService.updateProfile(
                eq(email),
                any(UpdateProfileRequest.class)
        )).thenReturn(response);

        mockMvc.perform(
                put("/api/v1/users/profile")
                        .principal(authentication)
                        .contentType(
                                MediaType.APPLICATION_JSON
                        )
                        .content(
                                objectMapper.writeValueAsString(
                                        request
                                )
                        )
        )
        .andExpect(status().isOk());
    }

    // =========================================================
    // UPDATE PROFILE - SERVICE CALLED
    // =========================================================

    @Test
    void updateProfile_ShouldCallUserService()
            throws Exception {

        UpdateProfileRequest request =
                new UpdateProfileRequest();

        request.setPhone("9876543210");
        request.setLocation("Odisha");
        request.setHeadline("Backend Developer");
        request.setSkills("Java, Spring Boot");

        UserProfileResponse response =
                UserProfileResponse.builder()
                        .id(1L)
                        .email(email)
                        .role("CANDIDATE")
                        .build();

        when(userService.updateProfile(
                eq(email),
                any(UpdateProfileRequest.class)
        )).thenReturn(response);

        mockMvc.perform(
                put("/api/v1/users/profile")
                        .principal(authentication)
                        .contentType(
                                MediaType.APPLICATION_JSON
                        )
                        .content(
                                objectMapper.writeValueAsString(
                                        request
                                )
                        )
        )
        .andExpect(status().isOk());

        verify(userService).updateProfile(
                eq(email),
                any(UpdateProfileRequest.class)
        );
    }

    // =========================================================
    // UPDATE PROFILE - RESPONSE DATA
    // =========================================================

    @Test
    void updateProfile_ShouldReturnUpdatedData()
            throws Exception {

        UpdateProfileRequest request =
                new UpdateProfileRequest();

        request.setPhone("9999999999");
        request.setLocation("Bangalore");
        request.setHeadline("Senior Java Developer");
        request.setBio("Experienced Java Developer");
        request.setSkills(
                "Java, Spring Boot, Hibernate, MySQL"
        );
        request.setExperience(3);

        UserProfileResponse response =
                UserProfileResponse.builder()
                        .id(5L)
                        .firstName("John")
                        .lastName("Doe")
                        .email(email)
                        .phone("9999999999")
                        .location("Bangalore")
                        .headline("Senior Java Developer")
                        .bio("Experienced Java Developer")
                        .skills(
                                "Java, Spring Boot, Hibernate, MySQL"
                        )
                        .experience(3)
                        .role("CANDIDATE")
                        .build();

        when(userService.updateProfile(
                eq(email),
                any(UpdateProfileRequest.class)
        )).thenReturn(response);

        mockMvc.perform(
                put("/api/v1/users/profile")
                        .principal(authentication)
                        .contentType(
                                MediaType.APPLICATION_JSON
                        )
                        .content(
                                objectMapper.writeValueAsString(
                                        request
                                )
                        )
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id")
                .value(5))
        .andExpect(jsonPath("$.email")
                .value(email))
        .andExpect(jsonPath("$.phone")
                .value("9999999999"))
        .andExpect(jsonPath("$.location")
                .value("Bangalore"))
        .andExpect(jsonPath("$.headline")
                .value("Senior Java Developer"))
        .andExpect(jsonPath("$.experience")
                .value(3));
    }

    // =========================================================
    // UPDATE PROFILE - EMPTY REQUEST
    // =========================================================

    @Test
    void updateProfile_ShouldStillCallService_WhenRequestIsEmpty()
            throws Exception {

        UpdateProfileRequest request =
                new UpdateProfileRequest();

        UserProfileResponse response =
                UserProfileResponse.builder()
                        .id(1L)
                        .email(email)
                        .role("CANDIDATE")
                        .build();

        when(userService.updateProfile(
                eq(email),
                any(UpdateProfileRequest.class)
        )).thenReturn(response);

        mockMvc.perform(
                put("/api/v1/users/profile")
                        .principal(authentication)
                        .contentType(
                                MediaType.APPLICATION_JSON
                        )
                        .content(
                                objectMapper.writeValueAsString(
                                        request
                                )
                        )
        )
        .andExpect(status().isOk());

        verify(userService).updateProfile(
                eq(email),
                any(UpdateProfileRequest.class)
        );
    }

    // =========================================================
    // GET PROFILE - DIFFERENT USER
    // =========================================================

    @Test
    void profile_ShouldUseAuthenticatedUserEmail()
            throws Exception {

        String authenticatedEmail =
                "candidate@example.com";

        when(authentication.getName())
                .thenReturn(authenticatedEmail);

        UserProfileResponse response =
                UserProfileResponse.builder()
                        .id(2L)
                        .email(authenticatedEmail)
                        .firstName("Candidate")
                        .lastName("User")
                        .role("CANDIDATE")
                        .build();

        when(userService.getProfile(authenticatedEmail))
                .thenReturn(response);

        mockMvc.perform(
                get("/api/v1/users/profile")
                        .principal(authentication)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.email")
                .value(authenticatedEmail));

        verify(userService)
                .getProfile(authenticatedEmail);
    }

    // =========================================================
    // UPDATE PROFILE - DIFFERENT USER
    // =========================================================

    @Test
    void updateProfile_ShouldUseAuthenticatedUserEmail()
            throws Exception {

        String authenticatedEmail =
                "candidate@example.com";

        when(authentication.getName())
                .thenReturn(authenticatedEmail);

        UpdateProfileRequest request =
                new UpdateProfileRequest();

        request.setLocation("Delhi");
        request.setSkills("Java");

        UserProfileResponse response =
                UserProfileResponse.builder()
                        .id(3L)
                        .email(authenticatedEmail)
                        .location("Delhi")
                        .skills("Java")
                        .role("CANDIDATE")
                        .build();

        when(userService.updateProfile(
                eq(authenticatedEmail),
                any(UpdateProfileRequest.class)
        )).thenReturn(response);

        mockMvc.perform(
                put("/api/v1/users/profile")
                        .principal(authentication)
                        .contentType(
                                MediaType.APPLICATION_JSON
                        )
                        .content(
                                objectMapper.writeValueAsString(
                                        request
                                )
                        )
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.email")
                .value(authenticatedEmail))
        .andExpect(jsonPath("$.location")
                .value("Delhi"))
        .andExpect(jsonPath("$.skills")
                .value("Java"));

        verify(userService).updateProfile(
                eq(authenticatedEmail),
                any(UpdateProfileRequest.class)
        );
    }
}