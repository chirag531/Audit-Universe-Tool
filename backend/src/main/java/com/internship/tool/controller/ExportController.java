package com.internship.tool.controller;

import com.internship.tool.dto.AuditItemResponse;
import com.internship.tool.service.AuditItemService;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/export")
public class ExportController {
    private final AuditItemService auditItemService;

    public ExportController(AuditItemService auditItemService) {
        this.auditItemService = auditItemService;
    }

    @GetMapping(value = "/audit-items", produces = "text/csv")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportAuditItemsCsv() {
        List<AuditItemResponse> rows = auditItemService.exportAll();
        StringBuilder sb = new StringBuilder();
        sb.append("id,title,payload,aiSummary,createdAt\n");
        for (AuditItemResponse r : rows) {
            sb.append(r.id())
                    .append(',')
                    .append(csv(r.title()))
                    .append(',')
                    .append(csv(r.payload()))
                    .append(',')
                    .append(csv(r.aiSummary() != null ? r.aiSummary() : ""))
                    .append(',')
                    .append(r.createdAt() != null ? r.createdAt().toString() : "")
                    .append('\n');
        }
        byte[] body = sb.toString().getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                        .filename("audit-items.csv")
                        .build()
                        .toString())
                .contentType(new MediaType("text", "csv", StandardCharsets.UTF_8))
                .body(body);
    }

    private static String csv(String raw) {
        if (raw == null) {
            return "\"\"";
        }
        String escaped = raw.replace("\"", "\"\"");
        return "\"" + escaped + "\"";
    }
}
