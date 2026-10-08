package com.hireai.user.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.hireai.user.dto.request.UpdateProfileRequest;
import com.hireai.user.dto.response.UserProfileResponse;
import com.hireai.user.entity.User;
import com.hireai.user.repository.UserRepository;
import com.hireai.user.service.UserService;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserServiceImpl userService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setFirstName("Debashis");
        user.setLastName("Satapathy");
        user.setEmail("test@example.com");
    }

    @Test
    void saveUser_ShouldSaveAndReturnUser() {

        when(userRepository.save(user)).thenReturn(user);

        User result = userService.saveUser(user);

        assertNotNull(result);
        assertEquals(user, result);

        verify(userRepository).save(user);
    }

    @Test
    void saveUser_WhenUserIsNull_ShouldThrowException() {

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.saveUser(null)
        );

        assertEquals("User is required.", exception.getMessage());

        verify(userRepository, never()).save(any());
    }

    @Test
    void findByEmail_ShouldReturnUser() {

        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(user));

        Optional<User> result =
                userService.findByEmail("test@example.com");

        assertTrue(result.isPresent());
        assertEquals(user, result.get());

        verify(userRepository)
                .findByEmail("test@example.com");
    }

    @Test
    void findByEmail_ShouldNormalizeEmail() {

        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(user));

        Optional<User> result =
                userService.findByEmail("  TEST@EXAMPLE.COM  ");

        assertTrue(result.isPresent());
        assertEquals(user, result.get());

        verify(userRepository)
                .findByEmail("test@example.com");
    }

    @Test
    void findByEmail_WhenEmailIsNull_ShouldReturnEmpty() {

        Optional<User> result =
                userService.findByEmail(null);

        assertTrue(result.isEmpty());

        verify(userRepository, never()).findByEmail(anyString());
    }

    @Test
    void findByEmail_WhenEmailIsBlank_ShouldReturnEmpty() {

        Optional<User> result =
                userService.findByEmail("   ");

        assertTrue(result.isEmpty());

        verify(userRepository, never()).findByEmail(anyString());
    }

    @Test
    void existsByEmail_ShouldReturnTrue() {

        when(userRepository.existsByEmail("test@example.com"))
                .thenReturn(true);

        boolean result =
                userService.existsByEmail("test@example.com");

        assertTrue(result);

        verify(userRepository)
                .existsByEmail("test@example.com");
    }

    @Test
    void existsByEmail_ShouldNormalizeEmail() {

        when(userRepository.existsByEmail("test@example.com"))
                .thenReturn(true);

        boolean result =
                userService.existsByEmail(" TEST@EXAMPLE.COM ");

        assertTrue(result);

        verify(userRepository)
                .existsByEmail("test@example.com");
    }

    @Test
    void existsByEmail_WhenEmailIsNull_ShouldReturnFalse() {

        boolean result =
                userService.existsByEmail(null);

        assertFalse(result);

        verify(userRepository, never()).existsByEmail(anyString());
    }

    @Test
    void getProfile_ShouldReturnProfile() {

        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(user));

        UserProfileResponse result =
                userService.getProfile("test@example.com");

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Debashis", result.getFirstName());
        assertEquals("Satapathy", result.getLastName());
        assertEquals("test@example.com", result.getEmail());

        verify(userRepository)
                .findByEmail("test@example.com");
    }

    @Test
    void getProfile_WhenUserDoesNotExist_ShouldThrowException() {

        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.getProfile("test@example.com")
        );

        assertEquals("User not found", exception.getMessage());

        verify(userRepository)
                .findByEmail("test@example.com");
    }

    @Test
    void getProfile_WhenEmailIsNull_ShouldThrowException() {

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.getProfile(null)
        );

        assertEquals("User email is required.", exception.getMessage());

        verify(userRepository, never()).findByEmail(anyString());
    }

    @Test
    void updateProfile_ShouldUpdateProfileFields() {

        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(user));

        when(userRepository.save(user))
                .thenReturn(user);

        UpdateProfileRequest request =
                new UpdateProfileRequest();

        request.setPhone("9876543210");
        request.setLocation("Bhubaneswar");
        request.setHeadline("Java Backend Developer");
        request.setBio("Spring Boot developer");
        request.setSkills("Java, Spring Boot, SQL");
        request.setExperience(2);
        request.setLinkedinUrl("https://linkedin.com/in/test");
        request.setGithubUrl("https://github.com/test");
        request.setPortfolioUrl("https://example.com");
        request.setProfileImage("profile.jpg");

        UserProfileResponse result =
                userService.updateProfile(
                        "test@example.com",
                        request
                );

        assertNotNull(result);

        assertEquals("9876543210", user.getPhone());
        assertEquals("Bhubaneswar", user.getLocation());
        assertEquals("Java Backend Developer", user.getHeadline());
        assertEquals("Spring Boot developer", user.getBio());
        assertEquals("Java, Spring Boot, SQL", user.getSkills());
        assertEquals(2, user.getExperience());
        assertEquals(
                "https://linkedin.com/in/test",
                user.getLinkedinUrl()
        );
        assertEquals(
                "https://github.com/test",
                user.getGithubUrl()
        );
        assertEquals(
                "https://example.com",
                user.getPortfolioUrl()
        );
        assertEquals("profile.jpg", user.getProfileImage());

        verify(userRepository).save(user);
    }

    @Test
    void updateProfile_ShouldTrimValues() {

        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(user));

        when(userRepository.save(user))
                .thenReturn(user);

        UpdateProfileRequest request =
                new UpdateProfileRequest();

        request.setPhone(" 9876543210 ");
        request.setLocation(" Bhubaneswar ");
        request.setHeadline(" Java Developer ");

        userService.updateProfile(
                "test@example.com",
                request
        );

        assertEquals("9876543210", user.getPhone());
        assertEquals("Bhubaneswar", user.getLocation());
        assertEquals("Java Developer", user.getHeadline());

        verify(userRepository).save(user);
    }

    @Test
    void updateProfile_WhenExperienceIsNegative_ShouldThrowException() {

        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(user));

        UpdateProfileRequest request =
                new UpdateProfileRequest();

        request.setExperience(-1);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.updateProfile(
                        "test@example.com",
                        request
                )
        );

        assertEquals(
                "Experience cannot be negative.",
                exception.getMessage()
        );

        verify(userRepository, never()).save(any());
    }

    @Test
    void updateProfile_WhenRequestIsNull_ShouldThrowException() {

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.updateProfile(
                        "test@example.com",
                        null
                )
        );

        assertEquals(
                "Profile update request is required.",
                exception.getMessage()
        );

        verify(userRepository, never()).findByEmail(anyString());
        verify(userRepository, never()).save(any());
    }

    @Test
    void updateProfile_WhenUserDoesNotExist_ShouldThrowException() {

        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.empty());

        UpdateProfileRequest request =
                new UpdateProfileRequest();

        request.setLocation("Bhubaneswar");

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.updateProfile(
                        "test@example.com",
                        request
                )
        );

        assertEquals(
                "User not found",
                exception.getMessage()
        );

        verify(userRepository, never()).save(any());
    }
}