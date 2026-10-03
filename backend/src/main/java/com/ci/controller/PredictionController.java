package com.ci.controller;

import com.ci.dto.PredictionRequest;
import com.ci.dto.PredictionResponse;
import com.ci.service.PredictionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/predictions")
@RequiredArgsConstructor
public class PredictionController {

    private final PredictionService predictionService;

    @PostMapping
    public ResponseEntity<PredictionResponse> createPrediction(@RequestBody PredictionRequest request) {
        return ResponseEntity.ok(predictionService.predict(request));
    }

    @GetMapping
    public ResponseEntity<Page<PredictionResponse>> getPredictions(
            @RequestParam(required = false) String risk,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
            
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(predictionService.getHistory(risk, customerId, dateFrom, dateTo, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PredictionResponse> getPrediction(@PathVariable Long id) {
        return ResponseEntity.ok(predictionService.getById(id));
    }
}
