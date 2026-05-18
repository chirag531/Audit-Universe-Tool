package com.internship.tool.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AuditItemRequest(
        @NotBlank @Size(max = 150) String title,
        @NotBlank String payload
) {
}
