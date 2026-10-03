package com.ci.controller;

import com.ci.service.MlServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/ml")
@RequiredArgsConstructor
public class MlController {

    private final MlServiceClient mlServiceClient;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getHealth() {
        return ResponseEntity.ok(mlServiceClient.getHealth());
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics() {
        return ResponseEntity.ok(mlServiceClient.getMetrics());
    }

    @GetMapping("/data-quality")
    public ResponseEntity<Map<String, Object>> getDataQuality() {
        return ResponseEntity.ok(mlServiceClient.getDataQuality());
    }
}
