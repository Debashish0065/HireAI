package com.hireai.notification.controller;

import com.hireai.notification.service.EmailNotificationService;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/test-email")
@Validated
public class EmailNotificationTestController {

    private final EmailNotificationService emailNotificationService;

    public EmailNotificationTestController(
            EmailNotificationService emailNotificationService
    ) {
        this.emailNotificationService = emailNotificationService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public String sendTestEmail(
            @RequestParam
            @NotBlank(message = "Recipient email is required")
            @Email(message = "Recipient email must be valid")
            String to
    ) {

        emailNotificationService.sendEmail(
                to.trim(),
                "HireAI Test Email",
                "Hello! This is a test email from HireAI."
        );

        return "Test email sent successfully";
    }
}