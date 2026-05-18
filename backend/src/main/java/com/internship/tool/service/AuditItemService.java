package com.internship.tool.service;

import com.internship.tool.dto.AuditItemRequest;
import com.internship.tool.dto.AuditItemResponse;
import java.util.List;

public interface AuditItemService {
    AuditItemResponse create(AuditItemRequest request, String username);
    List<AuditItemResponse> search(String query);
    AuditItemResponse getById(Long id);
    AuditItemResponse update(Long id, AuditItemRequest request, String username);
    void softDelete(Long id, String username);
    long countActive();
    List<AuditItemResponse> exportAll();
}
