package com.ci.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "retention_actions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RetentionAction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    private String status;
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "acted_by")
    private User actedBy;

    @Column(name = "acted_at")
    private LocalDateTime actedAt;
    
    @PrePersist
    protected void onCreate() {
        actedAt = LocalDateTime.now();
    }
}
