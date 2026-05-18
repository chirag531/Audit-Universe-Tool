package com.internship.tool.dto;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String role
) {
}
