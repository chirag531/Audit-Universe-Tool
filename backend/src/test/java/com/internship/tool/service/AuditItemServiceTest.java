package com.internship.tool.service;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import com.internship.tool.repository.AuditItemRepository;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AuditItemServiceTest {
    @Mock
    private AuditItemRepository repository;

    @Mock
    private AiServiceClient aiServiceClient;

    @Mock
    private EmailNotificationService emailNotificationService;

    @InjectMocks
    private AuditItemServiceImpl service;

    @Test
    void searchDelegatesToRepository() {
        when(repository.findByDeletedFalseAndTitleContainingIgnoreCase("pay")).thenReturn(List.of());
        assertTrue(service.search("pay").isEmpty());
    }
}
