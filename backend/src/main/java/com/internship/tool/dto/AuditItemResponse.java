package com.internship.tool.dto;

import com.internship.tool.entity.AuditItem;
import java.time.Instant;

public record AuditItemResponse(
        Long id,
        String title,
        String payload,
        String aiSummary,
        Instant createdAt
) {
    public static AuditItemResponse from(AuditItem item) {
        return new AuditItemResponse(item.getId(), item.getTitle(), item.getPayload(), item.getAiSummary(), item.getCreatedAt());
    }
}
