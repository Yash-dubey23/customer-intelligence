package com.ci.controller;

import com.ci.dto.OverviewResponse;
import com.ci.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/overview")
    public ResponseEntity<OverviewResponse> getOverview() {
        return ResponseEntity.ok(analyticsService.getOverview());
    }

    @GetMapping("/churn-trend")
    public ResponseEntity<List<Map<String, Object>>> getChurnTrend() {
        return ResponseEntity.ok(analyticsService.getChurnTrend());
    }

    @GetMapping("/risk-distribution")
    public ResponseEntity<List<Map<String, Object>>> getRiskDistribution() {
        return ResponseEntity.ok(analyticsService.getRiskDistribution());
    }

    @GetMapping("/segments")
    public ResponseEntity<List<Map<String, Object>>> getSegments() {
        return ResponseEntity.ok(analyticsService.getSegments());
    }
}
