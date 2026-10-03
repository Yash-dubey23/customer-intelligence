package com.ci.controller;

import com.ci.dto.SearchResult;
import com.ci.model.Customer;
import com.ci.model.Prediction;
import com.ci.repository.CustomerRepository;
import com.ci.repository.PredictionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final CustomerRepository customerRepository;
    private final PredictionRepository predictionRepository;

    @GetMapping
    public ResponseEntity<List<SearchResult>> search(@RequestParam String q) {
        List<SearchResult> results = new ArrayList<>();
        
        // Search customers by code
        Page<Customer> customers = customerRepository.findByCustomerCodeContainingIgnoreCase(q, PageRequest.of(0, 5));
        customers.forEach(c -> results.add(SearchResult.builder()
                .type("CUSTOMER")
                .id(c.getId())
                .label(c.getCustomerCode())
                .subLabel("Status: " + c.getActualChurn())
                .build()));
                
        // Try parsing q as prediction ID
        try {
            Long predId = Long.parseLong(q);
            Optional<Prediction> pred = predictionRepository.findById(predId);
            pred.ifPresent(p -> results.add(SearchResult.builder()
                    .type("PREDICTION")
                    .id(p.getId())
                    .label("Prediction #" + p.getId())
                    .subLabel("Risk: " + p.getRiskLevel())
                    .build()));
        } catch (NumberFormatException ignored) {}
        
        return ResponseEntity.ok(results);
    }
}
