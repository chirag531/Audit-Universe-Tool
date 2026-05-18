package com.internship.tool.controller;

import com.internship.tool.dto.AuditItemRequest;
import com.internship.tool.dto.AuditItemResponse;
import com.internship.tool.dto.StatsResponse;
import com.internship.tool.service.AuditItemService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/audit-items")
@PreAuthorize("hasAnyRole('USER','ADMIN')")
public class AuditItemController {
    private final AuditItemService service;

    public AuditItemController(AuditItemService service) {
        this.service = service;
    }

    @PostMapping
    public AuditItemResponse create(@Valid @RequestBody AuditItemRequest request, Principal principal) {
        return service.create(request, principal.getName());
    }

    @GetMapping
    public List<AuditItemResponse> list(@RequestParam(defaultValue = "") String q) {
        return service.search(q);
    }

    @GetMapping("/{id}")
    public AuditItemResponse get(@PathVariable Long id) {
        return service.getById(id);
    }

    @PutMapping("/{id}")
    public AuditItemResponse update(@PathVariable Long id, @Valid @RequestBody AuditItemRequest request, Principal principal) {
        return service.update(id, request, principal.getName());
    }

    @DeleteMapping("/{id}")
    public void softDelete(@PathVariable Long id, Principal principal) {
        service.softDelete(id, principal.getName());
    }

    @GetMapping("/stats")
    public StatsResponse stats() {
        return new StatsResponse(service.countActive());
    }
}
