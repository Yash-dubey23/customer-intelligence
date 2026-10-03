package com.ci.service;

import com.ci.dto.OverviewResponse;
import com.ci.repository.CustomerRepository;
import com.ci.repository.PredictionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final CustomerRepository customerRepository;
    private final PredictionRepository predictionRepository;

    public OverviewResponse getOverview() {
        long totalCustomers = customerRepository.count();
        long atRiskCustomers = customerRepository.countAtRiskCustomers();
        long highRiskCustomers = customerRepository.countHighRiskCustomers();
        long actualChurned = customerRepository.countByActualChurn("Yes");
        
        double churnRate = totalCustomers > 0 ? (double) actualChurned / totalCustomers : 0;
        
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        long predictionsThisMonth = predictionRepository.countPredictionsSince(startOfMonth);
        
        Double avgProbability = customerRepository.getAverageChurnProbability();
        if (avgProbability == null) avgProbability = 0.0;
        
        return OverviewResponse.builder()
                .totalCustomers(totalCustomers)
                .atRiskCustomers(atRiskCustomers)
                .highRiskCustomers(highRiskCustomers)
                .churnRate(churnRate)
                .predictionsThisMonth(predictionsThisMonth)
                .avgChurnProbability(avgProbability)
                .build();
    }

    public List<Map<String, Object>> getChurnTrend() {
        List<Object[]> rawData = predictionRepository.getPredictionTrend();
        return rawData.stream().map(row -> {
            Map<String, Object> map = new HashMap<>();
            map.put("date", row[0].toString());
            long total = ((Number) row[1]).longValue();
            long high = ((Number) row[2]).longValue();
            long medium = ((Number) row[3]).longValue();
            long low = ((Number) row[4]).longValue();
            map.put("total", total);
            map.put("totalPredictions", total);
            map.put("high", high);
            map.put("highRisk", high);
            map.put("medium", medium);
            map.put("low", low);
            return map;
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getRiskDistribution() {
        List<Object[]> rawData = predictionRepository.getRiskDistribution();
        return rawData.stream().map(row -> {
            Map<String, Object> map = new HashMap<>();
            map.put("level", row[0]);
            map.put("riskLevel", row[0]);
            map.put("count", row[1]);
            return map;
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getSegments() {
        List<Map<String, Object>> list = new java.util.ArrayList<>();
        list.addAll(formatSegmentData(customerRepository.getChurnByContract()));
        list.addAll(formatSegmentData(customerRepository.getChurnByTenure()));
        list.addAll(formatSegmentData(customerRepository.getChurnByPaymentMethod()));
        return list;
    }
    
    private List<Map<String, Object>> formatSegmentData(List<Object[]> rawData) {
        return rawData.stream().map(row -> {
            Map<String, Object> map = new HashMap<>();
            String label = row[0] != null ? row[0].toString() : "Unknown";
            long total = row[1] != null ? ((Number) row[1]).longValue() : 0;
            long churned = row[2] != null ? ((Number) row[2]).longValue() : 0;
            double churnRate = total > 0 ? (double) churned / total : 0;
            
            map.put("label", label);
            map.put("total", total);
            map.put("churned", churned);
            map.put("churnRate", churnRate);
            return map;
        }).collect(Collectors.toList());
    }
}
