package com.ci.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExportRow {
    private String customerCode;
    private String contract;
    private Integer tenure;
    private Double monthlyCharges;
    private String actualChurn;
    private String riskLevel;
    private Double probability;
}
