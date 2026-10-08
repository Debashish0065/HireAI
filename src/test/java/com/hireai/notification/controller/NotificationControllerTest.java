
package com.hireai.notification.controller;

import com.hireai.notification.dto.request.NotificationRequest;
import com.hireai.notification.dto.response.NotificationResponse;
import com.hireai.notification.enums.NotificationType;
import com.hireai.notification.service.NotificationService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationControllerTest {

    // =========================================================
    // MOCK SERVICE
    // =========================================================

    @Mock
    private NotificationService notificationService;

    // =========================================================
    // MOCK AUTHENTICATION
    // =========================================================

    @Mock
    private Authentication authentication;

    // =========================================================
    // CONTROLLER
    // =========================================================

    private NotificationController notificationController;

    // =========================================================
    // TEST DATA
    // =========================================================

    private final String userEmail =
            "candidate@gmail.com";

    private NotificationType notificationType;

    // =========================================================
    // SETUP
    // =========================================================

    @BeforeEach
    void setUp() {

        notificationController =
                new NotificationController(
                        notificationService
                );

        /*
         * Use the first enum value from the actual
         * NotificationType enum.
         *
         * This avoids depending on APPLICATION,
         * INTERVIEW, or any other enum constant.
         */
        notificationType =
                NotificationType.values()[0];
    }

    // =========================================================
    // HELPER - CREATE REQUEST
    // =========================================================

    private NotificationRequest createRequest() {

        return NotificationRequest.builder()
                .userId(1L)
                .title("Application Update")
                .message(
                        "Your application has been shortlisted."
                )
                .type(notificationType)
                .build();
    }

    // =========================================================
    // HELPER - CREATE RESPONSE
    // =========================================================

    private NotificationResponse createResponse() {

        return NotificationResponse.builder()
                .id(10L)
                .userId(1L)
                .title("Application Update")
                .message(
                        "Your application has been shortlisted."
                )
                .type(notificationType)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
    }

    // =========================================================
    // TEST 1
    // CREATE NOTIFICATION
    // =========================================================

    @Test
    void createNotification_ShouldReturnCreatedNotification() {

        NotificationRequest request =
                createRequest();

        NotificationResponse response =
                createResponse();

        when(
                notificationService.createNotification(
                        any(NotificationRequest.class)
                )
        ).thenReturn(response);

        ResponseEntity<NotificationResponse> result =
                notificationController.createNotification(
                        request
                );

        assertNotNull(result);

        assertEquals(
                201,
                result.getStatusCode().value()
        );

        assertNotNull(result.getBody());

        assertEquals(
                10L,
                result.getBody().getId()
        );

        assertEquals(
                1L,
                result.getBody().getUserId()
        );

        assertEquals(
                "Application Update",
                result.getBody().getTitle()
        );

        assertEquals(
                "Your application has been shortlisted.",
                result.getBody().getMessage()
        );

        assertEquals(
                notificationType,
                result.getBody().getType()
        );

        assertFalse(
                result.getBody().getIsRead()
        );

        verify(notificationService)
                .createNotification(
                        any(NotificationRequest.class)
                );
    }

    // =========================================================
    // TEST 2
    // GET MY NOTIFICATIONS
    // =========================================================

    @Test
    void getMyNotifications_ShouldReturnNotifications() {

        // Authentication is actually used in this test.
        when(authentication.getName())
                .thenReturn(userEmail);

        NotificationResponse response =
                createResponse();

        when(
                notificationService.getMyNotifications(
                        userEmail
                )
        ).thenReturn(
                List.of(response)
        );

        ResponseEntity<List<NotificationResponse>> result =
                notificationController.getMyNotifications(
                        authentication
                );

        assertNotNull(result);

        assertEquals(
                200,
                result.getStatusCode().value()
        );

        assertNotNull(result.getBody());

        assertEquals(
                1,
                result.getBody().size()
        );

        assertEquals(
                10L,
                result.getBody()
                        .get(0)
                        .getId()
        );

        assertEquals(
                1L,
                result.getBody()
                        .get(0)
                        .getUserId()
        );

        assertEquals(
                "Application Update",
                result.getBody()
                        .get(0)
                        .getTitle()
        );

        verify(notificationService)
                .getMyNotifications(
                        userEmail
                );
    }

    // =========================================================
    // TEST 3
    // GET UNREAD NOTIFICATIONS
    // =========================================================

    @Test
    void getUnreadNotifications_ShouldReturnUnreadNotifications() {

        // Authentication is actually used in this test.
        when(authentication.getName())
                .thenReturn(userEmail);

        NotificationResponse response =
                createResponse();

        when(
                notificationService.getUnreadNotifications(
                        userEmail
                )
        ).thenReturn(
                List.of(response)
        );

        ResponseEntity<List<NotificationResponse>> result =
                notificationController.getUnreadNotifications(
                        authentication
                );

        assertNotNull(result);

        assertEquals(
                200,
                result.getStatusCode().value()
        );

        assertNotNull(result.getBody());

        assertEquals(
                1,
                result.getBody().size()
        );

        assertEquals(
                10L,
                result.getBody()
                        .get(0)
                        .getId()
        );

        assertFalse(
                result.getBody()
                        .get(0)
                        .getIsRead()
        );

        verify(notificationService)
                .getUnreadNotifications(
                        userEmail
                );
    }

    // =========================================================
    // TEST 4
    // GET UNREAD COUNT
    // =========================================================

    @Test
    void getUnreadCount_ShouldReturnUnreadCount() {

        // Authentication is actually used in this test.
        when(authentication.getName())
                .thenReturn(userEmail);

        when(
                notificationService.getUnreadCount(
                        userEmail
                )
        ).thenReturn(5L);

        ResponseEntity<Long> result =
                notificationController.getUnreadCount(
                        authentication
                );

        assertNotNull(result);

        assertEquals(
                200,
                result.getStatusCode().value()
        );

        assertNotNull(result.getBody());

        assertEquals(
                5L,
                result.getBody()
        );

        verify(notificationService)
                .getUnreadCount(
                        userEmail
                );
    }

    // =========================================================
    // TEST 5
    // MARK ONE NOTIFICATION AS READ
    // =========================================================

    @Test
    void markAsRead_ShouldReturnUpdatedNotification() {

        // Authentication is actually used in this test.
        when(authentication.getName())
                .thenReturn(userEmail);

        NotificationResponse response =
                createResponse();

        response.setIsRead(true);

        when(
                notificationService.markAsRead(
                        10L,
                        userEmail
                )
        ).thenReturn(response);

        ResponseEntity<NotificationResponse> result =
                notificationController.markAsRead(
                        10L,
                        authentication
                );

        assertNotNull(result);

        assertEquals(
                200,
                result.getStatusCode().value()
        );

        assertNotNull(result.getBody());

        assertEquals(
                10L,
                result.getBody().getId()
        );

        assertTrue(
                result.getBody().getIsRead()
        );

        verify(notificationService)
                .markAsRead(
                        10L,
                        userEmail
                );
    }

    // =========================================================
    // TEST 6
    // MARK ALL NOTIFICATIONS AS READ
    // =========================================================

    @Test
    void markAllAsRead_ShouldReturnSuccessMessage() {

        // Authentication is actually used in this test.
        when(authentication.getName())
                .thenReturn(userEmail);

        doNothing()
                .when(notificationService)
                .markAllAsRead(
                        userEmail
                );

        ResponseEntity<String> result =
                notificationController.markAllAsRead(
                        authentication
                );

        assertNotNull(result);

        assertEquals(
                200,
                result.getStatusCode().value()
        );

        assertEquals(
                "All notifications marked as read",
                result.getBody()
        );

        verify(notificationService)
                .markAllAsRead(
                        userEmail
                );
    }

    // =========================================================
    // TEST 7
    // DELETE NOTIFICATION
    // =========================================================

    @Test
    void deleteNotification_ShouldReturnSuccessMessage() {

        // Authentication is actually used in this test.
        when(authentication.getName())
                .thenReturn(userEmail);

        doNothing()
                .when(notificationService)
                .deleteNotification(
                        10L,
                        userEmail
                );

        ResponseEntity<String> result =
                notificationController.deleteNotification(
                        10L,
                        authentication
                );

        assertNotNull(result);

        assertEquals(
                200,
                result.getStatusCode().value()
        );

        assertEquals(
                "Notification deleted successfully",
                result.getBody()
        );

        verify(notificationService)
                .deleteNotification(
                        10L,
                        userEmail
                );
    }
}