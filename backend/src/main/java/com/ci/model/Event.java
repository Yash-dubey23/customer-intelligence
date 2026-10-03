package com.ci.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "events")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private EventType type;

    @Column(name = "customer_id")
    private Long customerId;

    @Column(name = "prediction_id")
    private Long predictionId;

    private String message;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    public enum EventType {
        PREDICTION_COMPLETED,
        CUSTOMER_ADDED,
        CUSTOMER_UPDATED,
        MOVED_TO_HIGH_RISK,
        SERVICE_UNAVAILABLE,
        RETENTION_ACTION
    }
}
