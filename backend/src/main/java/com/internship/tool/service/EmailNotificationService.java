package com.internship.tool.service;

import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationService {
    private final Optional<JavaMailSender> mailSender;

    @Value("${app.reports.email-to}")
    private String reportEmailTo;

    public EmailNotificationService(Optional<JavaMailSender> mailSender) {
        this.mailSender = mailSender;
    }

    public void scheduleReminder(String username, String title) {
        // Reserved for async / queue integration; no-op for now.
    }

    @Scheduled(cron = "${app.reports.cron:0 0 9 * * *}")
    public void sendDailyDigest() {
        if (mailSender.isEmpty()) {
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(reportEmailTo);
            message.setSubject("Audit reminder");
            message.setText("Daily audit reminder executed.");
            mailSender.get().send(message);
        } catch (Exception ignored) {
            // SMTP often unavailable in local/docker without a real server.
        }
    }
}
