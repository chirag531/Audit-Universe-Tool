package com.internship.tool.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "audit_items")
public class AuditItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "created_by", nullable = false, length = 64)
    private String createdBy = "system";
    @Column(name = "updated_by", length = 64)
    private String updatedBy;
    @Column(nullable = false, length = 150)
    private String title;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String payload;
    @Column(name = "ai_summary", columnDefinition = "TEXT")
    private String aiSummary;
    @Column(nullable = false)
    private boolean deleted = false;
    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();
    @PreUpdate public void onUpdate() { this.updatedAt = Instant.now(); }
    public Long getId() { return id; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getPayload() { return payload; }
    public void setPayload(String payload) { this.payload = payload; }
    public String getAiSummary() { return aiSummary; }
    public void setAiSummary(String aiSummary) { this.aiSummary = aiSummary; }
    public boolean isDeleted() { return deleted; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }
    public Instant getCreatedAt() { return createdAt; }
}
