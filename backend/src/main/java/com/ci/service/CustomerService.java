package com.ci.service;

import com.ci.dto.CustomerListResponse;
import com.ci.dto.CustomerResponse;
import com.ci.model.Customer;
import com.ci.model.Event;
import com.ci.model.Prediction;
import com.ci.repository.CustomerRepository;
import com.ci.repository.PredictionRepository;
import com.ci.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final PredictionRepository predictionRepository;
    private final EventService eventService;

    @Transactional(readOnly = true)
    public CustomerListResponse list(String search, String riskLevel, String contract, 
                                     Integer tenureMin, Integer tenureMax, 
                                     Double probMin, Double probMax, Pageable pageable) {
        Page<Customer> customersPage;
        
        if (search != null && !search.isEmpty()) {
            customersPage = customerRepository.searchCustomers(search, pageable);
        } else if (riskLevel != null && !riskLevel.isEmpty()) {
            customersPage = customerRepository.findByRiskLevel(riskLevel, pageable);
        } else {
            customersPage = customerRepository.findAll(pageable);
        }
        
        List<CustomerResponse> content = customersPage.getContent().stream()
                .map(this::mapToResponseWithPrediction)
                .collect(Collectors.toList());
                
        // Post-filtering for params not supported in db query directly
        if (contract != null || tenureMin != null || tenureMax != null || probMin != null || probMax != null) {
            content = content.stream().filter(c -> {
                boolean match = true;
                if (contract != null && !contract.isEmpty()) {
                    match = match && contract.equals(c.getContract());
                }
                if (tenureMin != null) {
                    match = match && c.getTenure() != null && c.getTenure() >= tenureMin;
                }
                if (tenureMax != null) {
                    match = match && c.getTenure() != null && c.getTenure() <= tenureMax;
                }
                if (probMin != null && c.getLatestPrediction() != null) {
                    match = match && c.getLatestPrediction().getProbability() >= probMin;
                }
                if (probMax != null && c.getLatestPrediction() != null) {
                    match = match && c.getLatestPrediction().getProbability() <= probMax;
                }
                return match;
            }).collect(Collectors.toList());
        }
        
        return CustomerListResponse.builder()
                .content(content)
                .pageNo(customersPage.getNumber())
                .pageSize(customersPage.getSize())
                .totalElements(customersPage.getTotalElements())
                .totalPages(customersPage.getTotalPages())
                .last(customersPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public CustomerResponse getById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        return mapToResponseWithPrediction(customer);
    }
    
    @Transactional
    public void importFromCsv(List<Customer> customers) {
        customerRepository.saveAll(customers);
    }
    
    public long count() {
        return customerRepository.count();
    }

    private CustomerResponse mapToResponseWithPrediction(Customer customer) {
        Prediction latestPrediction = predictionRepository.findLatestByCustomerId(customer.getId()).orElse(null);
        
        CustomerResponse.PredictionSummary predSummary = null;
        if (latestPrediction != null) {
            predSummary = CustomerResponse.PredictionSummary.builder()
                    .id(latestPrediction.getId())
                    .probability(latestPrediction.getProbability())
                    .riskLevel(latestPrediction.getRiskLevel())
                    .createdAt(latestPrediction.getCreatedAt())
                    .build();
        }
        
        return CustomerResponse.builder()
                .id(customer.getId())
                .customerCode(customer.getCustomerCode())
                .gender(customer.getGender())
                .seniorCitizen(customer.getSeniorCitizen())
                .partner(customer.getPartner())
                .dependents(customer.getDependents())
                .tenure(customer.getTenure())
                .phoneService(customer.getPhoneService())
                .multipleLines(customer.getMultipleLines())
                .internetService(customer.getInternetService())
                .onlineSecurity(customer.getOnlineSecurity())
                .onlineBackup(customer.getOnlineBackup())
                .deviceProtection(customer.getDeviceProtection())
                .techSupport(customer.getTechSupport())
                .streamingTv(customer.getStreamingTv())
                .streamingMovies(customer.getStreamingMovies())
                .contract(customer.getContract())
                .paperlessBilling(customer.getPaperlessBilling())
                .paymentMethod(customer.getPaymentMethod())
                .monthlyCharges(customer.getMonthlyCharges())
                .totalCharges(customer.getTotalCharges())
                .actualChurn(customer.getActualChurn())
                .createdAt(customer.getCreatedAt())
                .updatedAt(customer.getUpdatedAt())
                .latestPrediction(predSummary)
                .build();
    }
}
