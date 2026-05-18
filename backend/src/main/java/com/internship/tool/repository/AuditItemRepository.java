package com.internship.tool.repository;

import com.internship.tool.entity.AuditItem;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditItemRepository extends JpaRepository<AuditItem, Long> {
    List<AuditItem> findByDeletedFalseAndTitleContainingIgnoreCase(String q);
    Optional<AuditItem> findByIdAndDeletedFalse(Long id);
    long countByDeletedFalse();
}
