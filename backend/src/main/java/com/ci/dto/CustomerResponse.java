package com.ci.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerResponse {
    private Long id;
    private String customerCode;
    private String gender;
    private Integer seniorCitizen;
    private String partner;
    private String dependents;
    private Integer tenure;
    private String phoneService;
    private String multipleLines;
    private String internetService;
    private String onlineSecurity;
    private String onlineBackup;
    private String deviceProtection;
    private String techSupport;
    private String streamingTv;
    private String streamingMovies;
    private String contract;
    private String paperlessBilling;
    private String paymentMethod;
    private Double monthlyCharges;
    private Double totalCharges;
    private String actualChurn;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private PredictionSummary latestPrediction;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PredictionSummary {
        private Long id;
        private Double probability;
        private String riskLevel;
        private LocalDateTime createdAt;
    }
}
