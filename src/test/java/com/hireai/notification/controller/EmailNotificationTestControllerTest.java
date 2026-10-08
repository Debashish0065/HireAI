package com.hireai.notification.controller;

import com.hireai.notification.service.EmailNotificationService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailNotificationTestControllerTest {

    // =========================================================
    // MOCK EMAIL SERVICE
    // =========================================================

    @Mock
    private EmailNotificationService emailNotificationService;

    // =========================================================
    // CONTROLLER
    // =========================================================

    private EmailNotificationTestController emailController;

    // =========================================================
    // TEST DATA
    // =========================================================

    private final String recipientEmail =
            "candidate@gmail.com";

    // =========================================================
    // SETUP
    // =========================================================

    @BeforeEach
    void setUp() {

        emailController =
                new EmailNotificationTestController(
                        emailNotificationService
                );
    }

    // =========================================================
    // TEST 1
    // SEND TEST EMAIL SUCCESSFULLY
    // =========================================================

    @Test
    void sendTestEmail_ShouldReturnSuccessMessage() {

        doNothing()
                .when(emailNotificationService)
                .sendEmail(
                        recipientEmail,
                        "HireAI Test Email",
                        "Hello! This is a test email from HireAI."
                );

        String result =
                emailController.sendTestEmail(
                        recipientEmail
                );

        assertNotNull(result);

        assertEquals(
                "Test email sent successfully",
                result
        );

        verify(emailNotificationService)
                .sendEmail(
                        recipientEmail,
                        "HireAI Test Email",
                        "Hello! This is a test email from HireAI."
                );
    }

    // =========================================================
    // TEST 2
    // VERIFY CORRECT RECIPIENT
    // =========================================================

    @Test
    void sendTestEmail_ShouldSendEmailToCorrectRecipient() {

        emailController.sendTestEmail(
                recipientEmail
        );

        verify(emailNotificationService)
                .sendEmail(
                        eq(recipientEmail),
                        eq("HireAI Test Email"),
                        eq("Hello! This is a test email from HireAI.")
                );
    }

    // =========================================================
    // TEST 3
    // VERIFY SUBJECT
    // =========================================================

    @Test
    void sendTestEmail_ShouldUseCorrectSubject() {

        emailController.sendTestEmail(
                recipientEmail
        );

        verify(emailNotificationService)
                .sendEmail(
                        eq(recipientEmail),
                        eq("HireAI Test Email"),
                        anyString()
                );
    }

    // =========================================================
    // TEST 4
    // VERIFY MESSAGE
    // =========================================================

    @Test
    void sendTestEmail_ShouldUseCorrectMessage() {

        emailController.sendTestEmail(
                recipientEmail
        );

        verify(emailNotificationService)
                .sendEmail(
                        eq(recipientEmail),
                        eq("HireAI Test Email"),
                        eq("Hello! This is a test email from HireAI.")
                );
    }

    // =========================================================
    // TEST 5
    // VERIFY EMAIL SERVICE CALLED ONLY ONCE
    // =========================================================

    @Test
    void sendTestEmail_ShouldCallEmailServiceOnlyOnce() {

        emailController.sendTestEmail(
                recipientEmail
        );

        verify(emailNotificationService, times(1))
                .sendEmail(
                        recipientEmail,
                        "HireAI Test Email",
                        "Hello! This is a test email from HireAI."
                );
    }

    // =========================================================
    // TEST 6
    // VERIFY DIFFERENT RECIPIENT
    // =========================================================

    @Test
    void sendTestEmail_ShouldWorkWithDifferentRecipient() {

        String anotherEmail =
                "hr@gmail.com";

        emailController.sendTestEmail(
                anotherEmail
        );

        verify(emailNotificationService)
                .sendEmail(
                        anotherEmail,
                        "HireAI Test Email",
                        "Hello! This is a test email from HireAI."
                );
    }
}