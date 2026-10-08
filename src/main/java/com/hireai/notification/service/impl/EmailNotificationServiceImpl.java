package com.hireai.notification.service.impl;

import com.hireai.notification.service.EmailNotificationService;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationServiceImpl
        implements EmailNotificationService {

    private final JavaMailSender mailSender;

    public EmailNotificationServiceImpl(
            JavaMailSender mailSender
    ) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendEmail(
            String to,
            String subject,
            String message
    ) {

        if (to == null || to.isBlank()) {
            throw new IllegalArgumentException(
                    "Recipient email is required."
            );
        }

        if (subject == null || subject.isBlank()) {
            throw new IllegalArgumentException(
                    "Email subject is required."
            );
        }

        if (message == null || message.isBlank()) {
            throw new IllegalArgumentException(
                    "Email message is required."
            );
        }

        String recipient = to.trim();

        SimpleMailMessage mailMessage =
                new SimpleMailMessage();

        mailMessage.setTo(recipient);
        mailMessage.setSubject(subject.trim());
        mailMessage.setText(message.trim());

        try {
            mailSender.send(mailMessage);
        } catch (MailException ex) {
            throw new IllegalStateException(
                    "Failed to send email notification.",
                    ex
            );
        }
    }
}