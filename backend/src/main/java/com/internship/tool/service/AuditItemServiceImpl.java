package com.internship.tool.service;

import com.internship.tool.dto.AiResultDto;
import com.internship.tool.dto.AuditItemRequest;
import com.internship.tool.dto.AuditItemResponse;
import com.internship.tool.entity.AuditItem;
import com.internship.tool.exception.ResourceNotFoundException;
import com.internship.tool.repository.AuditItemRepository;
import java.util.List;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class AuditItemServiceImpl implements AuditItemService {
    private static final String CACHE = "auditItems";

    private final AuditItemRepository repository;
    private final AiServiceClient aiServiceClient;
    private final EmailNotificationService emailNotificationService;

    public AuditItemServiceImpl(
            AuditItemRepository repository,
            AiServiceClient aiServiceClient,
            EmailNotificationService emailNotificationService) {
        this.repository = repository;
        this.aiServiceClient = aiServiceClient;
        this.emailNotificationService = emailNotificationService;
    }

    @Override
    @CacheEvict(value = CACHE, allEntries = true)
    public AuditItemResponse create(AuditItemRequest request, String username) {
        AiResultDto ai = aiServiceClient.describe(request.payload());
        AuditItem item = new AuditItem();
        item.setTitle(request.title());
        item.setPayload(request.payload());
        item.setAiSummary(ai.summary());
        item.setCreatedBy(username);
        item = repository.save(item);
        emailNotificationService.scheduleReminder(username, item.getTitle());
        return AuditItemResponse.from(item);
    }

    @Override
    public List<AuditItemResponse> search(String query) {
        return repository.findByDeletedFalseAndTitleContainingIgnoreCase(query).stream()
                .map(AuditItemResponse::from)
                .toList();
    }

    @Override
    @Cacheable(value = CACHE, key = "#id")
    public AuditItemResponse getById(Long id) {
        return AuditItemResponse.from(
                repository.findByIdAndDeletedFalse(id).orElseThrow(() -> new ResourceNotFoundException("Audit item not found")));
    }

    @Override
    @CacheEvict(value = CACHE, key = "#id")
    public AuditItemResponse update(Long id, AuditItemRequest request, String username) {
        AuditItem item = repository.findByIdAndDeletedFalse(id).orElseThrow(() -> new ResourceNotFoundException("Audit item not found"));
        item.setTitle(request.title());
        item.setPayload(request.payload());
        item.setAiSummary(aiServiceClient.describe(request.payload()).summary());
        item.setUpdatedBy(username);
        return AuditItemResponse.from(repository.save(item));
    }

    @Override
    @CacheEvict(value = CACHE, key = "#id")
    public void softDelete(Long id, String username) {
        AuditItem item = repository.findByIdAndDeletedFalse(id).orElseThrow(() -> new ResourceNotFoundException("Audit item not found"));
        item.setDeleted(true);
        item.setUpdatedBy(username);
        repository.save(item);
    }

    @Override
    public long countActive() {
        return repository.countByDeletedFalse();
    }

    @Override
    public List<AuditItemResponse> exportAll() {
        return repository.findByDeletedFalseAndTitleContainingIgnoreCase("").stream()
                .map(AuditItemResponse::from)
                .toList();
    }
}
