package com.hireai.notification.service;

public interface EmailNotificationService {

    /**
     * Send a simple email notification.
     *
     * @param to recipient email
     * @param subject email subject
     * @param message email message
     */
    void sendEmail(
            String to,
            String subject,
            String message
    );
}