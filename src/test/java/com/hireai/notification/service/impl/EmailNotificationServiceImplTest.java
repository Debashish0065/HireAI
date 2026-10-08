package com.hireai.notification.service.impl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailNotificationServiceImplTest {

    @Mock
    private JavaMailSender mailSender;

    private EmailNotificationServiceImpl emailNotificationService;

    @BeforeEach
    void setUp() {

        emailNotificationService =
                new EmailNotificationServiceImpl(
                        mailSender
                );
    }

    // =========================================================
    // 1. SEND EMAIL SUCCESSFULLY
    // =========================================================

    @Test
    void sendEmail_ShouldSendEmailSuccessfully() {

        emailNotificationService.sendEmail(
                "candidate@gmail.com",
                "Interview Scheduled",
                "Your interview has been scheduled."
        );

        ArgumentCaptor<SimpleMailMessage> captor =
                ArgumentCaptor.forClass(
                        SimpleMailMessage.class
                );

        verify(mailSender, times(1))
                .send(captor.capture());

        SimpleMailMessage message =
                captor.getValue();

        assertNotNull(message);

        assertArrayEquals(
                new String[]{"candidate@gmail.com"},
                message.getTo()
        );

        assertEquals(
                "Interview Scheduled",
                message.getSubject()
        );

        assertEquals(
                "Your interview has been scheduled.",
                message.getText()
        );
    }

    // =========================================================
    // 2. VERIFY RECIPIENT
    // =========================================================

    @Test
    void sendEmail_ShouldSetCorrectRecipient() {

        emailNotificationService.sendEmail(
                "user@example.com",
                "Test Subject",
                "Test Message"
        );

        ArgumentCaptor<SimpleMailMessage> captor =
                ArgumentCaptor.forClass(
                        SimpleMailMessage.class
                );

        verify(mailSender)
                .send(captor.capture());

        SimpleMailMessage message =
                captor.getValue();

        assertNotNull(message.getTo());

        assertEquals(
                1,
                message.getTo().length
        );

        assertEquals(
                "user@example.com",
                message.getTo()[0]
        );
    }

    // =========================================================
    // 3. VERIFY SUBJECT
    // =========================================================

    @Test
    void sendEmail_ShouldSetCorrectSubject() {

        emailNotificationService.sendEmail(
                "user@example.com",
                "Welcome to HireAI",
                "Welcome message"
        );

        ArgumentCaptor<SimpleMailMessage> captor =
                ArgumentCaptor.forClass(
                        SimpleMailMessage.class
                );

        verify(mailSender)
                .send(captor.capture());

        assertEquals(
                "Welcome to HireAI",
                captor.getValue().getSubject()
        );
    }

    // =========================================================
    // 4. VERIFY MESSAGE BODY
    // =========================================================

    @Test
    void sendEmail_ShouldSetCorrectMessage() {

        String messageText =
                "Your application has been shortlisted.";

        emailNotificationService.sendEmail(
                "candidate@example.com",
                "Application Update",
                messageText
        );

        ArgumentCaptor<SimpleMailMessage> captor =
                ArgumentCaptor.forClass(
                        SimpleMailMessage.class
                );

        verify(mailSender)
                .send(captor.capture());

        assertEquals(
                messageText,
                captor.getValue().getText()
        );
    }

    // =========================================================
    // 5. VERIFY ALL EMAIL DETAILS
    // =========================================================

    @Test
    void sendEmail_ShouldSetAllEmailDetailsCorrectly() {

        String to =
                "hr@company.com";

        String subject =
                "Candidate Selected";

        String messageText =
                "Congratulations! You have been selected.";

        emailNotificationService.sendEmail(
                to,
                subject,
                messageText
        );

        ArgumentCaptor<SimpleMailMessage> captor =
                ArgumentCaptor.forClass(
                        SimpleMailMessage.class
                );

        verify(mailSender)
                .send(captor.capture());

        SimpleMailMessage message =
                captor.getValue();

        assertNotNull(message);

        assertArrayEquals(
                new String[]{to},
                message.getTo()
        );

        assertEquals(
                subject,
                message.getSubject()
        );

        assertEquals(
                messageText,
                message.getText()
        );
    }

    // =========================================================
    // 6. VERIFY SEND CALLED ONLY ONCE
    // =========================================================

    @Test
    void sendEmail_ShouldCallMailSenderOnlyOnce() {

        emailNotificationService.sendEmail(
                "test@gmail.com",
                "Test",
                "Hello"
        );

        verify(
                mailSender,
                times(1)
        ).send(
                any(SimpleMailMessage.class)
        );
    }

    // =========================================================
    // 7. VERIFY NO EXTRA EMAIL
    // =========================================================

    @Test
    void sendEmail_ShouldNotSendMoreThanOneEmail() {

        emailNotificationService.sendEmail(
                "test@gmail.com",
                "Test",
                "Hello"
        );

        verify(
                mailSender,
                times(1)
        ).send(
                any(SimpleMailMessage.class)
        );

        verifyNoMoreInteractions(
                mailSender
        );
    }

    // =========================================================
    // 8. BLANK RECIPIENT SHOULD BE REJECTED
    // =========================================================

    @Test
    void sendEmail_ShouldRejectBlankRecipient() {

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                emailNotificationService.sendEmail(
                                        "   ",
                                        "Test Subject",
                                        "Test message"
                                )
                );

        assertEquals(
                "Recipient email is required.",
                exception.getMessage()
        );

        verifyNoInteractions(mailSender);
    }

    // =========================================================
    // 9. NULL RECIPIENT SHOULD BE REJECTED
    // =========================================================

    @Test
    void sendEmail_ShouldRejectNullRecipient() {

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                emailNotificationService.sendEmail(
                                        null,
                                        "Test Subject",
                                        "Test message"
                                )
                );

        assertEquals(
                "Recipient email is required.",
                exception.getMessage()
        );

        verifyNoInteractions(mailSender);
    }

    // =========================================================
    // 10. BLANK SUBJECT SHOULD BE REJECTED
    // =========================================================

    @Test
    void sendEmail_ShouldRejectBlankSubject() {

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                emailNotificationService.sendEmail(
                                        "test@gmail.com",
                                        "   ",
                                        "Test message"
                                )
                );

        assertEquals(
                "Email subject is required.",
                exception.getMessage()
        );

        verifyNoInteractions(mailSender);
    }

    // =========================================================
    // 11. NULL SUBJECT SHOULD BE REJECTED
    // =========================================================

    @Test
    void sendEmail_ShouldRejectNullSubject() {

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                emailNotificationService.sendEmail(
                                        "test@gmail.com",
                                        null,
                                        "Test message"
                                )
                );

        assertEquals(
                "Email subject is required.",
                exception.getMessage()
        );

        verifyNoInteractions(mailSender);
    }

    // =========================================================
    // 12. BLANK MESSAGE SHOULD BE REJECTED
    // =========================================================

    @Test
    void sendEmail_ShouldRejectBlankMessage() {

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                emailNotificationService.sendEmail(
                                        "test@gmail.com",
                                        "Test Subject",
                                        "   "
                                )
                );

        assertEquals(
                "Email message is required.",
                exception.getMessage()
        );

        verifyNoInteractions(mailSender);
    }

    // =========================================================
    // 13. NULL MESSAGE SHOULD BE REJECTED
    // =========================================================

    @Test
    void sendEmail_ShouldRejectNullMessage() {

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                emailNotificationService.sendEmail(
                                        "test@gmail.com",
                                        "Test Subject",
                                        null
                                )
                );

        assertEquals(
                "Email message is required.",
                exception.getMessage()
        );

        verifyNoInteractions(mailSender);
    }

    // =========================================================
    // 14. MAIL SENDER FAILURE SHOULD BE WRAPPED
    // =========================================================

    @Test
    void sendEmail_ShouldThrowIllegalStateExceptionWhenMailSenderFails() {

        MailException mailException =
                new MailException(
                        "Mail server unavailable"
                ) {
                };

        doThrow(mailException)
                .when(mailSender)
                .send(
                        any(SimpleMailMessage.class)
                );

        IllegalStateException exception =
                assertThrows(
                        IllegalStateException.class,
                        () ->
                                emailNotificationService.sendEmail(
                                        "test@gmail.com",
                                        "Test",
                                        "Hello"
                                )
                );

        assertEquals(
                "Failed to send email notification.",
                exception.getMessage()
        );

        assertSame(
                mailException,
                exception.getCause()
        );

        verify(
                mailSender,
                times(1)
        ).send(
                any(SimpleMailMessage.class)
        );
    }

    // =========================================================
    // 15. VERIFY MESSAGE OBJECT IS NOT NULL
    // =========================================================

    @Test
    void sendEmail_ShouldCreateNonNullMessage() {

        emailNotificationService.sendEmail(
                "candidate@gmail.com",
                "Notification",
                "You have a new notification."
        );

        ArgumentCaptor<SimpleMailMessage> captor =
                ArgumentCaptor.forClass(
                        SimpleMailMessage.class
                );

        verify(mailSender)
                .send(captor.capture());

        assertNotNull(
                captor.getValue()
        );
    }

    // =========================================================
    // 16. VERIFY MULTIPLE SENDS
    // =========================================================

    @Test
    void sendEmail_ShouldSendMultipleEmailsWhenCalledMultipleTimes() {

        emailNotificationService.sendEmail(
                "one@gmail.com",
                "First",
                "First message"
        );

        emailNotificationService.sendEmail(
                "two@gmail.com",
                "Second",
                "Second message"
        );

        verify(
                mailSender,
                times(2)
        ).send(
                any(SimpleMailMessage.class)
        );
    }

    // =========================================================
    // 17. VERIFY SECOND EMAIL DATA
    // =========================================================

    @Test
    void sendEmail_ShouldPreserveCorrectDataForSecondCall() {

        emailNotificationService.sendEmail(
                "first@gmail.com",
                "First Subject",
                "First Message"
        );

        emailNotificationService.sendEmail(
                "second@gmail.com",
                "Second Subject",
                "Second Message"
        );

        ArgumentCaptor<SimpleMailMessage> captor =
                ArgumentCaptor.forClass(
                        SimpleMailMessage.class
                );

        verify(
                mailSender,
                times(2)
        ).send(
                captor.capture()
        );

        var messages =
                captor.getAllValues();

        assertEquals(
                "first@gmail.com",
                messages.get(0).getTo()[0]
        );

        assertEquals(
                "First Subject",
                messages.get(0).getSubject()
        );

        assertEquals(
                "First Message",
                messages.get(0).getText()
        );

        assertEquals(
                "second@gmail.com",
                messages.get(1).getTo()[0]
        );

        assertEquals(
                "Second Subject",
                messages.get(1).getSubject()
        );

        assertEquals(
                "Second Message",
                messages.get(1).getText()
        );
    }

    // =========================================================
    // 18. VERIFY LONG MESSAGE
    // =========================================================

    @Test
    void sendEmail_ShouldHandleLongMessage() {

        String longMessage =
                "This is a long notification message. "
                        + "It contains interview information, "
                        + "application status, candidate feedback, "
                        + "and other important recruitment details.";

        emailNotificationService.sendEmail(
                "candidate@gmail.com",
                "Detailed Notification",
                longMessage
        );

        ArgumentCaptor<SimpleMailMessage> captor =
                ArgumentCaptor.forClass(
                        SimpleMailMessage.class
                );

        verify(mailSender)
                .send(captor.capture());

        assertEquals(
                longMessage,
                captor.getValue().getText()
        );
    }

    // =========================================================
    // 19. VERIFY SPECIAL CHARACTERS
    // =========================================================

    @Test
    void sendEmail_ShouldHandleSpecialCharacters() {

        String message =
                "Hello Candidate! Your score is 95%. "
                        + "Role: Java Developer @ HireAI.";

        emailNotificationService.sendEmail(
                "candidate@gmail.com",
                "Interview @ HireAI",
                message
        );

        ArgumentCaptor<SimpleMailMessage> captor =
                ArgumentCaptor.forClass(
                        SimpleMailMessage.class
                );

        verify(mailSender)
                .send(captor.capture());

        SimpleMailMessage mail =
                captor.getValue();

        assertEquals(
                "Interview @ HireAI",
                mail.getSubject()
        );

        assertEquals(
                message,
                mail.getText()
        );
    }

    // =========================================================
    // 20. VERIFY INPUT IS TRIMMED
    // =========================================================

    @Test
    void sendEmail_ShouldTrimRecipientSubjectAndMessage() {

        emailNotificationService.sendEmail(
                "  candidate@gmail.com  ",
                "  Interview Scheduled  ",
                "  Your interview is scheduled.  "
        );

        ArgumentCaptor<SimpleMailMessage> captor =
                ArgumentCaptor.forClass(
                        SimpleMailMessage.class
                );

        verify(mailSender)
                .send(captor.capture());

        SimpleMailMessage message =
                captor.getValue();

        assertArrayEquals(
                new String[]{"candidate@gmail.com"},
                message.getTo()
        );

        assertEquals(
                "Interview Scheduled",
                message.getSubject()
        );

        assertEquals(
                "Your interview is scheduled.",
                message.getText()
        );
    }
}