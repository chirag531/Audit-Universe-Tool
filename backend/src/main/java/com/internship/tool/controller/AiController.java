package com.internship.tool.controller;

import com.internship.tool.dto.AiResultDto;
import com.internship.tool.service.AiServiceClient;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.Map;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Validated
@RestController
@RequestMapping("/api/ai")
@PreAuthorize("hasAnyRole('USER','ADMIN')")
public class AiController {
    private final AiServiceClient aiServiceClient;

    public AiController(AiServiceClient aiServiceClient) {
        this.aiServiceClient = aiServiceClient;
    }

    public record TextBody(@NotBlank String text) {}

    @PostMapping("/describe")
    public Map<String, Object> describe(@Valid @RequestBody TextBody body) {
        AiResultDto r = aiServiceClient.describe(body.text());
        return Map.of("summary", r.summary(), "source", r.source());
    }

    @PostMapping("/recommend")
    public Map<String, Object> recommend(@Valid @RequestBody TextBody body) {
        AiResultDto r = aiServiceClient.recommend(body.text());
        return Map.of("recommendations", r.summary(), "source", r.source());
    }

    @PostMapping("/report")
    public Map<String, Object> report(@Valid @RequestBody TextBody body) {
        AiResultDto r = aiServiceClient.report(body.text());
        return Map.of("report", r.summary(), "source", r.source());
    }
}
