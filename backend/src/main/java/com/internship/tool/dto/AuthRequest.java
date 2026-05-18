package com.internship.tool.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AuthRequest(
        @NotBlank String username,
        @Email String email,
        @NotBlank String password
) {
}
