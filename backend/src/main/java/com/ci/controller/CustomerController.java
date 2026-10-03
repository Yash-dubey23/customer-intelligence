package com.ci.controller;

import com.ci.dto.CustomerListResponse;
import com.ci.dto.CustomerResponse;
import com.ci.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    public ResponseEntity<CustomerListResponse> listCustomers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String risk,
            @RequestParam(required = false) String contract,
            @RequestParam(required = false) Integer tenureMin,
            @RequestParam(required = false) Integer tenureMax,
            @RequestParam(required = false) Double probMin,
            @RequestParam(required = false) Double probMax,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort) {
            
        String[] sortParams = sort.split(",");
        Sort sortObj = Sort.by(Sort.Direction.fromString(sortParams[1]), sortParams[0]);
        Pageable pageable = PageRequest.of(page, size, sortObj);
        
        return ResponseEntity.ok(customerService.list(search, risk, contract, tenureMin, tenureMax, probMin, probMax, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponse> getCustomer(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getById(id));
    }

    @PostMapping("/import")
    public ResponseEntity<String> importCustomers() {
        return ResponseEntity.ok("Import handled by DataSeeder");
    }
}
