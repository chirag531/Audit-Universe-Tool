package com.internship.tool.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 100)
    private String action;
    @Column(name = "actor_username", nullable = false, length = 64)
    private String actorUsername;
    @Column(name = "resource_type", nullable = false, length = 64)
    private String resourceType;
    @Column(name = "resource_id")
    private Long resourceId;
    @Column(columnDefinition = "TEXT")
    private String detail;
    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();
    public Long getId() { return id; }
    public void setAction(String action) { this.action = action; }
    public void setActorUsername(String actorUsername) { this.actorUsername = actorUsername; }
    public void setResourceType(String resourceType) { this.resourceType = resourceType; }
    public void setResourceId(Long resourceId) { this.resourceId = resourceId; }
    public void setDetail(String detail) { this.detail = detail; }
}
