package com.ci.service;

import com.ci.dto.PredictionRequest;
import com.ci.dto.PredictionResponse;
import com.ci.model.Customer;
import com.ci.model.Event;
import com.ci.model.Prediction;
import com.ci.model.User;
import com.ci.repository.CustomerRepository;
import com.ci.repository.PredictionRepository;
import com.ci.repository.UserRepository;
import com.ci.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PredictionService {

    private final PredictionRepository predictionRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final MlServiceClient mlServiceClient;
    private final EventService eventService;

    @Transactional
    public PredictionResponse predict(PredictionRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId()));
                
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email).orElse(null);

        Map<String, Object> mlRequest = new HashMap<>();
        mlRequest.put("features", request.getFeatures());
        
        Map<String, Object> mlResponse = mlServiceClient.predict(mlRequest);
        
        Double probability = (Double) mlResponse.get("churn_probability");
        String riskLevel = (String) mlResponse.get("risk_level");
        String modelName = (String) mlResponse.get("model");
        
        Prediction prediction = Prediction.builder()
                .customer(customer)
                .probability(probability)
                .riskLevel(riskLevel)
                .modelName(modelName)
                .status("COMPLETED")
                .createdBy(currentUser)
                .build();
                
        Prediction savedPrediction = predictionRepository.save(prediction);
        
        eventService.createEvent(
                Event.EventType.PREDICTION_COMPLETED,
                customer.getId(),
                savedPrediction.getId(),
                "Generated prediction with " + (probability * 100) + "% churn probability (" + riskLevel + " risk)"
        );
        
        if ("HIGH".equals(riskLevel)) {
            eventService.createEvent(
                    Event.EventType.MOVED_TO_HIGH_RISK,
                    customer.getId(),
                    savedPrediction.getId(),
                    "Customer moved to HIGH risk level"
            );
        }
        
        return mapToResponse(savedPrediction);
    }

    @Transactional(readOnly = true)
    public Page<PredictionResponse> getHistory(String riskLevel, Long customerId, LocalDateTime dateFrom, LocalDateTime dateTo, Pageable pageable) {
        Page<Prediction> predictions;
        
        if (customerId != null) {
            predictions = predictionRepository.findByCustomerId(customerId, pageable);
        } else if (riskLevel != null && !riskLevel.isEmpty()) {
            predictions = predictionRepository.findByRiskLevel(riskLevel, pageable);
        } else if (dateFrom != null && dateTo != null) {
            predictions = predictionRepository.findByDateRange(dateFrom, dateTo, pageable);
        } else {
            predictions = predictionRepository.findAll(pageable);
        }
        
        return predictions.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public PredictionResponse getById(Long id) {
        Prediction prediction = predictionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prediction not found with id: " + id));
        return mapToResponse(prediction);
    }
    
    @Transactional(readOnly = true)
    public List<PredictionResponse> getByCustomerId(Long customerId) {
        return predictionRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    private PredictionResponse mapToResponse(Prediction prediction) {
        return PredictionResponse.builder()
                .id(prediction.getId())
                .customerId(prediction.getCustomer().getId())
                .customerCode(prediction.getCustomer().getCustomerCode())
                .probability(prediction.getProbability())
                .riskLevel(prediction.getRiskLevel())
                .modelName(prediction.getModelName())
                .status(prediction.getStatus())
                .createdAt(prediction.getCreatedAt())
                .build();
    }
}
