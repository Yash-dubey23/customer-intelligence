package com.ci.service;

import com.ci.dto.RetentionActionRequest;
import com.ci.model.Customer;
import com.ci.model.Event;
import com.ci.model.RetentionAction;
import com.ci.model.User;
import com.ci.repository.CustomerRepository;
import com.ci.repository.RetentionActionRepository;
import com.ci.repository.UserRepository;
import com.ci.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RetentionService {

    private final RetentionActionRepository retentionActionRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final EventService eventService;

    @Transactional
    public RetentionAction createAction(RetentionActionRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId()));
                
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email).orElse(null);

        RetentionAction action = RetentionAction.builder()
                .customer(customer)
                .status(request.getStatus())
                .notes(request.getNotes())
                .actedBy(currentUser)
                .build();

        RetentionAction savedAction = retentionActionRepository.save(action);
        
        eventService.createEvent(
                Event.EventType.RETENTION_ACTION,
                customer.getId(),
                null,
                "Retention action taken: " + request.getStatus() + " - " + request.getNotes()
        );
        
        return savedAction;
    }

    @Transactional(readOnly = true)
    public List<com.ci.dto.RetentionActionResponse> getByCustomerId(Long customerId) {
        return retentionActionRepository.findByCustomerIdOrderByActedAtDesc(customerId).stream()
                .map(this::mapToResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    public com.ci.dto.RetentionActionResponse mapToResponse(RetentionAction action) {
        return com.ci.dto.RetentionActionResponse.builder()
                .id(action.getId())
                .customerId(action.getCustomer() != null ? action.getCustomer().getId() : null)
                .status(action.getStatus())
                .notes(action.getNotes())
                .actedBy(action.getActedBy() != null ? action.getActedBy().getId() : null)
                .actedAt(action.getActedAt())
                .build();
    }
}
