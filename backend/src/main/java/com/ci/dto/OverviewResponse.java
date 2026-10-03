package com.ci.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OverviewResponse {
    private long totalCustomers;
    private long atRiskCustomers;
    private long highRiskCustomers;
    private double churnRate;
    private long predictionsThisMonth;
    private double avgChurnProbability;
}
