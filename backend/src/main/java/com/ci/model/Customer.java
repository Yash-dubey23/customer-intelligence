package com.ci.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "customers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_code", unique = true, nullable = false)
    private String customerCode;

    private String gender;
    
    @Column(name = "senior_citizen")
    private Integer seniorCitizen;
    
    private String partner;
    private String dependents;
    private Integer tenure;
    
    @Column(name = "phone_service")
    private String phoneService;
    
    @Column(name = "multiple_lines")
    private String multipleLines;
    
    @Column(name = "internet_service")
    private String internetService;
    
    @Column(name = "online_security")
    private String onlineSecurity;
    
    @Column(name = "online_backup")
    private String onlineBackup;
    
    @Column(name = "device_protection")
    private String deviceProtection;
    
    @Column(name = "tech_support")
    private String techSupport;
    
    @Column(name = "streaming_tv")
    private String streamingTv;
    
    @Column(name = "streaming_movies")
    private String streamingMovies;
    
    private String contract;
    
    @Column(name = "paperless_billing")
    private String paperlessBilling;
    
    @Column(name = "payment_method")
    private String paymentMethod;
    
    @Column(name = "monthly_charges")
    private Double monthlyCharges;
    
    @Column(name = "total_charges")
    private Double totalCharges;
    
    @Column(name = "actual_churn")
    private String actualChurn;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
