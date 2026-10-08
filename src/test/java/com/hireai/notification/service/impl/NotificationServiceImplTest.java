package com.hireai.notification.service.impl;

import com.hireai.notification.dto.request.NotificationRequest;
import com.hireai.notification.dto.response.NotificationResponse;
import com.hireai.notification.entity.Notification;
import com.hireai.notification.enums.NotificationType;
import com.hireai.notification.repository.NotificationRepository;
import com.hireai.notification.service.EmailNotificationService;
import com.hireai.user.entity.User;
import com.hireai.user.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceImplTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailNotificationService emailNotificationService;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    private User user;
    private Notification notification;

    @BeforeEach
    void setUp() {

        user = User.builder()
                .id(1L)
                .firstName("Test")
                .lastName("User")
                .email("test@gmail.com")
                .build();

        notification = Notification.builder()
                .id(100L)
                .user(user)
                .title("Test Notification")
                .message("This is a test notification")
                .type(NotificationType.APPLICATION_SUBMITTED)
                .isRead(false)
                .build();
    }

    // =========================================================
    // CREATE NOTIFICATION
    // =========================================================

    @Test
    void createNotification_ShouldCreateSuccessfully() {

        NotificationRequest request =
                NotificationRequest.builder()
                        .userId(1L)
                        .title("Application Submitted")
                        .message("Your application was submitted.")
                        .type(NotificationType.APPLICATION_SUBMITTED)
                        .build();

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(user));

        when(notificationRepository.save(any(Notification.class)))
                .thenReturn(notification);

        NotificationResponse response =
                notificationService.createNotification(request);

        assertNotNull(response);

        assertEquals(
                100L,
                response.getId()
        );

        assertEquals(
                "Test Notification",
                response.getTitle()
        );

        assertEquals(
                "This is a test notification",
                response.getMessage()
        );

        assertEquals(
                NotificationType.APPLICATION_SUBMITTED,
                response.getType()
        );

        assertFalse(response.getIsRead());

        verify(notificationRepository)
                .save(any(Notification.class));

        verify(emailNotificationService)
                .sendEmail(
                        "test@gmail.com",
                        "Application Submitted",
                        "Your application was submitted."
                );
    }

    // =========================================================
    // CREATE - USER NOT FOUND
    // =========================================================

    @Test
    void createNotification_ShouldThrowException_WhenUserNotFound() {

        NotificationRequest request =
                NotificationRequest.builder()
                        .userId(99L)
                        .title("Test")
                        .message("Test message")
                        .type(NotificationType.APPLICATION_SUBMITTED)
                        .build();

        when(userRepository.findById(99L))
                .thenReturn(Optional.empty());

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                notificationService
                                        .createNotification(request)
                );

        assertEquals(
                "User not found.",
                exception.getMessage()
        );

        verify(notificationRepository, never())
                .save(any());

        verifyNoInteractions(emailNotificationService);
    }

    // =========================================================
    // CREATE - NULL REQUEST
    // =========================================================

    @Test
    void createNotification_ShouldThrowException_WhenRequestIsNull() {

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                notificationService
                                        .createNotification(null)
                );

        assertEquals(
                "Notification request is required.",
                exception.getMessage()
        );

        verifyNoInteractions(
                notificationRepository,
                userRepository,
                emailNotificationService
        );
    }

    // =========================================================
    // CREATE - INVALID USER ID
    // =========================================================

    @Test
    void createNotification_ShouldThrowException_WhenUserIdIsInvalid() {

        NotificationRequest request =
                NotificationRequest.builder()
                        .userId(0L)
                        .title("Test")
                        .message("Test message")
                        .type(NotificationType.APPLICATION_SUBMITTED)
                        .build();

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                notificationService
                                        .createNotification(request)
                );

        assertEquals(
                "User ID must be greater than 0.",
                exception.getMessage()
        );

        verifyNoInteractions(
                userRepository,
                notificationRepository,
                emailNotificationService
        );
    }

    // =========================================================
    // CREATE - EMAIL FAILURE SHOULD NOT FAIL NOTIFICATION
    // =========================================================

    @Test
    void createNotification_ShouldSaveNotification_WhenEmailFails() {

        NotificationRequest request =
                NotificationRequest.builder()
                        .userId(1L)
                        .title("Test")
                        .message("Test message")
                        .type(NotificationType.APPLICATION_SUBMITTED)
                        .build();

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(user));

        when(notificationRepository.save(any(Notification.class)))
                .thenReturn(notification);

        doThrow(
                new RuntimeException("Email failed")
        )
                .when(emailNotificationService)
                .sendEmail(
                        anyString(),
                        anyString(),
                        anyString()
                );

        NotificationResponse response =
                notificationService.createNotification(request);

        assertNotNull(response);

        verify(notificationRepository)
                .save(any(Notification.class));

        verify(emailNotificationService)
                .sendEmail(
                        "test@gmail.com",
                        "Test",
                        "Test message"
                );
    }

    // =========================================================
    // CREATE - USER WITHOUT EMAIL
    // =========================================================

    @Test
    void createNotification_ShouldCreateNotification_WhenUserHasNoEmail() {

        user.setEmail(null);

        NotificationRequest request =
                NotificationRequest.builder()
                        .userId(1L)
                        .title("Test")
                        .message("Test message")
                        .type(NotificationType.SYSTEM)
                        .build();

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(user));

        when(notificationRepository.save(any(Notification.class)))
                .thenReturn(notification);

        NotificationResponse response =
                notificationService.createNotification(request);

        assertNotNull(response);

        verify(notificationRepository)
                .save(any(Notification.class));

        verifyNoInteractions(emailNotificationService);
    }

    // =========================================================
    // CREATE - CONTENT IS TRIMMED
    // =========================================================

    @Test
    void createNotification_ShouldTrimNotificationContent() {

        NotificationRequest request =
                NotificationRequest.builder()
                        .userId(1L)
                        .title("  Application Submitted  ")
                        .message("  Your application was submitted.  ")
                        .type(NotificationType.APPLICATION_SUBMITTED)
                        .build();

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(user));

        when(notificationRepository.save(any(Notification.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0)
                );

        NotificationResponse response =
                notificationService.createNotification(request);

        assertEquals(
                "Application Submitted",
                response.getTitle()
        );

        assertEquals(
                "Your application was submitted.",
                response.getMessage()
        );

        verify(emailNotificationService)
                .sendEmail(
                        "test@gmail.com",
                        "Application Submitted",
                        "Your application was submitted."
                );
    }

    // =========================================================
    // GET MY NOTIFICATIONS
    // =========================================================

    @Test
    void getMyNotifications_ShouldReturnNotifications() {

        when(userRepository.findByEmail("test@gmail.com"))
                .thenReturn(Optional.of(user));

        when(notificationRepository
                .findByUserOrderByCreatedAtDesc(user))
                .thenReturn(List.of(notification));

        List<NotificationResponse> response =
                notificationService.getMyNotifications(
                        "test@gmail.com"
                );

        assertNotNull(response);
        assertEquals(1, response.size());

        assertEquals(
                100L,
                response.get(0).getId()
        );

        assertEquals(
                "Test Notification",
                response.get(0).getTitle()
        );

        verify(notificationRepository)
                .findByUserOrderByCreatedAtDesc(user);
    }

    // =========================================================
    // GET MY NOTIFICATIONS - USER NOT FOUND
    // =========================================================

    @Test
    void getMyNotifications_ShouldThrowException_WhenUserNotFound() {

        when(userRepository.findByEmail("unknown@gmail.com"))
                .thenReturn(Optional.empty());

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                notificationService
                                        .getMyNotifications(
                                                "unknown@gmail.com"
                                        )
                );

        assertEquals(
                "User not found.",
                exception.getMessage()
        );
    }

    // =========================================================
    // GET MY NOTIFICATIONS - BLANK EMAIL
    // =========================================================

    @Test
    void getMyNotifications_ShouldThrowException_WhenEmailIsBlank() {

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                notificationService
                                        .getMyNotifications("   ")
                );

        assertEquals(
                "User email is required.",
                exception.getMessage()
        );

        verifyNoInteractions(userRepository);
    }

    // =========================================================
    // GET UNREAD NOTIFICATIONS
    // =========================================================

    @Test
    void getUnreadNotifications_ShouldReturnUnreadNotifications() {

        when(userRepository.findByEmail("test@gmail.com"))
                .thenReturn(Optional.of(user));

        when(notificationRepository
                .findByUserAndIsReadFalseOrderByCreatedAtDesc(user))
                .thenReturn(List.of(notification));

        List<NotificationResponse> response =
                notificationService.getUnreadNotifications(
                        "test@gmail.com"
                );

        assertNotNull(response);
        assertEquals(1, response.size());

        assertFalse(
                response.get(0).getIsRead()
        );

        verify(notificationRepository)
                .findByUserAndIsReadFalseOrderByCreatedAtDesc(
                        user
                );
    }

    // =========================================================
    // GET UNREAD COUNT
    // =========================================================

    @Test
    void getUnreadCount_ShouldReturnCorrectCount() {

        when(userRepository.findByEmail("test@gmail.com"))
                .thenReturn(Optional.of(user));

        when(notificationRepository
                .countByUserAndIsReadFalse(user))
                .thenReturn(5L);

        long count =
                notificationService.getUnreadCount(
                        "test@gmail.com"
                );

        assertEquals(5L, count);

        verify(notificationRepository)
                .countByUserAndIsReadFalse(user);
    }

    // =========================================================
    // MARK ONE AS READ
    // =========================================================

    @Test
    void markAsRead_ShouldMarkNotificationAsRead() {

        when(userRepository.findByEmail("test@gmail.com"))
                .thenReturn(Optional.of(user));

        when(notificationRepository
                .findByIdAndUser(100L, user))
                .thenReturn(Optional.of(notification));

        when(notificationRepository.save(notification))
                .thenReturn(notification);

        NotificationResponse response =
                notificationService.markAsRead(
                        100L,
                        "test@gmail.com"
                );

        assertTrue(
                notification.getIsRead()
        );

        assertNotNull(response);

        assertTrue(
                response.getIsRead()
        );

        verify(notificationRepository)
                .findByIdAndUser(100L, user);

        verify(notificationRepository)
                .save(notification);
    }

    // =========================================================
    // MARK ONE AS READ - NOT FOUND
    // =========================================================

    @Test
    void markAsRead_ShouldThrowException_WhenNotificationNotFound() {

        when(userRepository.findByEmail("test@gmail.com"))
                .thenReturn(Optional.of(user));

        when(notificationRepository
                .findByIdAndUser(999L, user))
                .thenReturn(Optional.empty());

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                notificationService.markAsRead(
                                        999L,
                                        "test@gmail.com"
                                )
                );

        assertEquals(
                "Notification not found.",
                exception.getMessage()
        );

        verify(notificationRepository, never())
                .save(any());
    }

    // =========================================================
    // MARK ONE AS READ - OWNERSHIP PROTECTION
    // =========================================================

    @Test
    void markAsRead_ShouldThrowException_WhenNotificationDoesNotBelongToUser() {

        when(userRepository.findByEmail("test@gmail.com"))
                .thenReturn(Optional.of(user));

        when(notificationRepository
                .findByIdAndUser(100L, user))
                .thenReturn(Optional.empty());

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                notificationService.markAsRead(
                                        100L,
                                        "test@gmail.com"
                                )
                );

        assertEquals(
                "Notification not found.",
                exception.getMessage()
        );

        verify(notificationRepository, never())
                .save(any());
    }

    // =========================================================
    // MARK ONE AS READ - INVALID ID
    // =========================================================

    @Test
    void markAsRead_ShouldThrowException_WhenNotificationIdIsInvalid() {

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                notificationService.markAsRead(
                                        0L,
                                        "test@gmail.com"
                                )
                );

        assertEquals(
                "Notification ID must be greater than 0.",
                exception.getMessage()
        );

        verifyNoInteractions(
                userRepository,
                notificationRepository
        );
    }

    // =========================================================
    // MARK ALL AS READ
    // =========================================================

    @Test
    void markAllAsRead_ShouldMarkAllNotificationsAsRead() {

        Notification unread =
                Notification.builder()
                        .id(101L)
                        .user(user)
                        .title("Unread")
                        .message("Unread message")
                        .type(NotificationType.APPLICATION_SUBMITTED)
                        .isRead(false)
                        .build();

        Notification alreadyRead =
                Notification.builder()
                        .id(102L)
                        .user(user)
                        .title("Read")
                        .message("Read message")
                        .type(NotificationType.APPLICATION_SUBMITTED)
                        .isRead(true)
                        .build();

        when(userRepository.findByEmail("test@gmail.com"))
                .thenReturn(Optional.of(user));

        when(notificationRepository
                .findByUserOrderByCreatedAtDesc(user))
                .thenReturn(
                        List.of(
                                unread,
                                alreadyRead
                        )
                );

        notificationService.markAllAsRead(
                "test@gmail.com"
        );

        assertTrue(
                unread.getIsRead()
        );

        assertTrue(
                alreadyRead.getIsRead()
        );

        verify(notificationRepository)
                .saveAll(
                        List.of(
                                unread,
                                alreadyRead
                        )
                );
    }

    // =========================================================
    // MARK ALL AS READ - ALREADY READ
    // =========================================================

    @Test
    void markAllAsRead_ShouldNotSave_WhenAllNotificationsAreAlreadyRead() {

        Notification alreadyReadOne =
                Notification.builder()
                        .id(101L)
                        .user(user)
                        .title("Read One")
                        .message("Already read")
                        .type(NotificationType.SYSTEM)
                        .isRead(true)
                        .build();

        Notification alreadyReadTwo =
                Notification.builder()
                        .id(102L)
                        .user(user)
                        .title("Read Two")
                        .message("Already read")
                        .type(NotificationType.SYSTEM)
                        .isRead(true)
                        .build();

        when(userRepository.findByEmail("test@gmail.com"))
                .thenReturn(Optional.of(user));

        when(notificationRepository
                .findByUserOrderByCreatedAtDesc(user))
                .thenReturn(
                        List.of(
                                alreadyReadOne,
                                alreadyReadTwo
                        )
                );

        notificationService.markAllAsRead(
                "test@gmail.com"
        );

        verify(notificationRepository, never())
                .saveAll(anyList());
    }

    // =========================================================
    // MARK ALL AS READ - NO NOTIFICATIONS
    // =========================================================

    @Test
    void markAllAsRead_ShouldDoNothing_WhenUserHasNoNotifications() {

        when(userRepository.findByEmail("test@gmail.com"))
                .thenReturn(Optional.of(user));

        when(notificationRepository
                .findByUserOrderByCreatedAtDesc(user))
                .thenReturn(List.of());

        notificationService.markAllAsRead(
                "test@gmail.com"
        );

        verify(notificationRepository, never())
                .saveAll(anyList());
    }

    // =========================================================
    // DELETE NOTIFICATION
    // =========================================================

    @Test
    void deleteNotification_ShouldDeleteSuccessfully() {

        when(userRepository.findByEmail("test@gmail.com"))
                .thenReturn(Optional.of(user));

        when(notificationRepository
                .findByIdAndUser(100L, user))
                .thenReturn(Optional.of(notification));

        notificationService.deleteNotification(
                100L,
                "test@gmail.com"
        );

        verify(notificationRepository)
                .findByIdAndUser(100L, user);

        verify(notificationRepository)
                .delete(notification);
    }

    // =========================================================
    // DELETE - NOT FOUND
    // =========================================================

    @Test
    void deleteNotification_ShouldThrowException_WhenNotificationNotFound() {

        when(userRepository.findByEmail("test@gmail.com"))
                .thenReturn(Optional.of(user));

        when(notificationRepository
                .findByIdAndUser(999L, user))
                .thenReturn(Optional.empty());

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                notificationService
                                        .deleteNotification(
                                                999L,
                                                "test@gmail.com"
                                        )
                );

        assertEquals(
                "Notification not found.",
                exception.getMessage()
        );

        verify(notificationRepository, never())
                .delete(any());
    }

    // =========================================================
    // DELETE - OWNERSHIP PROTECTION
    // =========================================================

    @Test
    void deleteNotification_ShouldThrowException_WhenNotificationDoesNotBelongToUser() {

        when(userRepository.findByEmail("test@gmail.com"))
                .thenReturn(Optional.of(user));

        when(notificationRepository
                .findByIdAndUser(100L, user))
                .thenReturn(Optional.empty());

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                notificationService
                                        .deleteNotification(
                                                100L,
                                                "test@gmail.com"
                                        )
                );

        assertEquals(
                "Notification not found.",
                exception.getMessage()
        );

        verify(notificationRepository, never())
                .delete(any());
    }

    // =========================================================
    // DELETE - INVALID ID
    // =========================================================

    @Test
    void deleteNotification_ShouldThrowException_WhenNotificationIdIsInvalid() {

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                notificationService
                                        .deleteNotification(
                                                0L,
                                                "test@gmail.com"
                                        )
                );

        assertEquals(
                "Notification ID must be greater than 0.",
                exception.getMessage()
        );

        verifyNoInteractions(
                userRepository,
                notificationRepository
        );
    }
}