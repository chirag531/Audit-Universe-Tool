package com.internship.tool.service;

import com.internship.tool.dto.AiResultDto;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
public class AiServiceClient {
    private final RestClient restClient = RestClient.create();

    @Value("${app.ai.base-url}")
    private String baseUrl;

    @Value("${app.ai.api-key}")
    private String apiKey;

    public AiResultDto describe(String text) {
        return postJson("/describe", text, "summary");
    }

    public AiResultDto recommend(String text) {
        return postJson("/recommend", text, "recommendations");
    }

    public AiResultDto report(String text) {
        return postJson("/generate-report", text, "report");
    }

    private AiResultDto postJson(String path, String text, String resultKey) {
        for (int attempt = 1; attempt <= 3; attempt++) {
            try {
                Map<?, ?> response = restClient
                        .post()
                        .uri(baseUrl + path)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-API-Key", apiKey)
                        .body(Map.of("text", text != null ? text : ""))
                        .retrieve()
                        .body(Map.class);
                Object raw = response != null ? response.get(resultKey) : null;
                String value = raw != null ? String.valueOf(raw) : "";
                return new AiResultDto(value, "remote");
            } catch (RestClientException ex) {
                if (attempt == 3) {
                    break;
                }
                try {
                    Thread.sleep(200L * attempt);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }
        String clip = text == null ? "" : text;
        return new AiResultDto("Fallback: " + clip.substring(0, Math.min(clip.length(), 120)), "fallback");
    }
}
