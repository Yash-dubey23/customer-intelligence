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
public class PredictionResponse {
    private Long id;
    private Long customerId;
    private String customerCode;
    private Double probability;
    private String riskLevel;
    private String modelName;
    private String status;
    private LocalDateTime createdAt;
}
